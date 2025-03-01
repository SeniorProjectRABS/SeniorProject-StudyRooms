from datetime import datetime, timedelta, date

from django.core.mail import send_mail
from django.urls import reverse
from rest_framework import serializers
from django.core.exceptions import ValidationError

from .models import Student, StudyRoom, Reservation, TimeSlot

TIMESLOT_DURATION_MINUTES = 30
MAX_RESERVATION_HOURS = 2
MAX_TIMESLOTS = int((MAX_RESERVATION_HOURS * 60) / TIMESLOT_DURATION_MINUTES) # Calculate max timeslots

def send_reservation_confirmation_email(reservation, confirmation_url, cancellation_url):
    subject = 'Your Study Room Reservation Confirmation'
    message = f'Dear {reservation.student.name},\n\n' \
              f'Please confirm your booking within 1 hour by visiting:\n{confirmation_url}\n\n' \
              f'Your reservation for EIEAB Study Room {reservation.study_room} on {reservation.date.strftime("%A, %B %d, %Y")} ' \
              f'from {reservation.start_time.strftime("%I:%M %p")} to {reservation.end_time.strftime("%I:%M %p")} is submitted.\n\n' \
              f'To cancel this booking visit:\n{cancellation_url}\n\n' \
              f'Thank you for reserving with our system!'
    from_email = 'reservations@yourstudyrooms.com'
    recipient_list = [reservation.student.email]
    send_mail(subject, message, from_email, recipient_list, fail_silently=True)

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email']

class StudyRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyRoom
        fields = ['room_number', 'floor']

class TimeSlotSerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(
        help_text="Start time of the time slot (e.g., 09:00)",
        style={'input_type': 'time', 'format': '%I:%M %p'},
        format='%I:%M %p'
    )
    end_time = serializers.TimeField(
        help_text="End time of the time slot (e.g., 09:30)",
        style={'input_type': 'time', 'format': '%I:%M %p'},
        format='%I:%M %p'
    )

    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time']


class ReservationSerializer(serializers.ModelSerializer):
    timeslots = serializers.PrimaryKeyRelatedField(
        queryset=TimeSlot.objects.all(),
        many=True, # Important: Indicate it's a ManyToMany relation
        style={'base_template': 'checkbox_multiple.html'} # For browsable API (makes it checkboxes)
    )
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    study_room = serializers.PrimaryKeyRelatedField(queryset=StudyRoom.objects.all())
    date = serializers.DateField()
    start_time = serializers.TimeField(format='%I:%M %p', read_only=True)  # 12-hour format with AM/PM
    end_time = serializers.TimeField(format='%I:%M %p', read_only=True)  # 12-hour format with AM/PM

    class Meta:
        model = Reservation
        fields = ['id', 'student', 'study_room', 'timeslots', 'date', 'created_at', 'start_time', 'end_time'] # Include timeslots, start_time, end_time
        read_only_fields = ['start_time', 'end_time', 'created_at'] # start_time/end_time are auto-calculated


    def validate_timeslots(self, value):
        """
        Validates the list of timeslots provided.
        """
        if not value:
            raise serializers.ValidationError("Please select at least one timeslot.")

        if len(value) > MAX_TIMESLOTS:
            raise serializers.ValidationError(f"Maximum reservation duration is {MAX_RESERVATION_HOURS} hours (max {MAX_TIMESLOTS} timeslots).")

        if len(set(value)) != len(value): # Check for duplicates
            raise serializers.ValidationError("Duplicate timeslots are not allowed.")


        sorted_timeslots = sorted(list(value), key=lambda ts: ts.start_time) # Sort TimeSlot instances by start_time
        previous_timeslot = None
        for current_timeslot in sorted_timeslots:
            if previous_timeslot:
                expected_next_start_time = (datetime.combine(date.today(), previous_timeslot.end_time) +
                                             timedelta(minutes=TIMESLOT_DURATION_MINUTES)).time()
                if current_timeslot.start_time != previous_timeslot.end_time:
                    raise serializers.ValidationError("Timeslots must be consecutive 30-minute intervals.")
            previous_timeslot = current_timeslot

        return value

    def validate(self, data):
        """
        Combined validation including timeslot-specific checks and overall reservation validation,
        including room availability check.
        """
        timeslots = data.get('timeslots')
        study_room = data.get('study_room')
        date = data.get('date')

        if timeslots:
            self.validate_timeslots(timeslots)  # Validate timeslots themselves

        if timeslots and study_room and date:  # Perform availability check only if we have all the data
            for timeslot in timeslots:
                room_overlap_reservations = Reservation.objects.filter(
                    study_room=study_room,
                    date=date,
                    timeslots__in=[timeslot],
                )
                if room_overlap_reservations.exists():
                    # Format timeslot string to 12-hour format for error message
                    start_time_12hr = timeslot.start_time.strftime('%I:%M %p')
                    end_time_12hr = timeslot.end_time.strftime('%I:%M %p')
                    timeslot_str_12hr = f"{start_time_12hr} - {end_time_12hr}"

                    raise serializers.ValidationError(
                        f"This study room is already reserved for timeslot: {timeslot_str_12hr}.")

        # Model-level validation (clean method) will handle overlapping reservations - NO LONGER DOING THIS FOR TIMESLOTS

        return data

    def create(self, validated_data):
        """Creates a Reservation instance with multiple timeslots and sends confirmation email."""

        timeslots = validated_data.pop('timeslots')
        reservation = Reservation(**validated_data)  # Create unsaved instance

        reservation.save()  # Explicitly save now to get an ID
        print(f"Reservation created and saved, ID: {reservation.id}")  # Debug print

        # Set start_time and end_time based on timeslots (before setting timeslots and sending email)
        reservation.start_time = timeslots[0].start_time
        reservation.end_time = timeslots[-1].end_time
        reservation.save()  # Save again to store start_time and end_time

        reservation.timeslots.set(timeslots)
        print(f"Timeslots set successfully, Reservation ID: {reservation.id}")  # Debug print

        confirmation_url = self.context['request'].build_absolute_uri(
            reverse('reservation-confirm', kwargs={'reservation_id': reservation.id})
        )
        cancellation_url = self.context['request'].build_absolute_uri(
            reverse('reservation-cancel', kwargs={'reservation_id': reservation.id})
        )

        send_reservation_confirmation_email(reservation, confirmation_url, cancellation_url) # Call email function with URLs

        return reservation

    def update(self, instance, validated_data):
        """Updates a Reservation instance including timeslots."""
        timeslots = validated_data.pop('timeslots', None) # Extract timeslots, if provided

        instance.student = validated_data.get('student', instance.student)
        instance.study_room = validated_data.get('study_room', instance.study_room)
        instance.date = validated_data.get('date', instance.date)

        if timeslots is not None: # Update timeslots only if they are provided in the update request
            instance.timeslots.set(timeslots) # Update the ManyToMany relationship

        instance.save() # Model's save method will run clean() for validation
        return instance