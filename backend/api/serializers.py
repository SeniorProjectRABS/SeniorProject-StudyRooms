from datetime import datetime, timedelta, date

from django.core.mail import send_mail
from django.urls import reverse
from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from .models import Student, StudyRoom, Reservation, TimeSlot

TIMESLOT_DURATION_MINUTES = 30
MAX_RESERVATION_HOURS = 2
MAX_TIMESLOTS = int((MAX_RESERVATION_HOURS * 60) / TIMESLOT_DURATION_MINUTES)

def send_reservation_confirmation_email(reservation, confirmation_url, cancellation_url):
    student_name = reservation.student.name if hasattr(reservation, 'student') and reservation.student else '[Student Name Missing]'
    student_email = reservation.student.email if hasattr(reservation, 'student') and reservation.student else '[Student Email Missing]'

    subject = 'Your Study Room Reservation Confirmation'
    message = f'Dear {student_name},\n\n' \
              f'Please confirm your booking within 1 hour by visiting:\n{confirmation_url}\n\n' \
              f'Your reservation for EIEAB Study Room {reservation.study_room} on {reservation.date.strftime("%A, %B %d, %Y")} ' \
              f'from {reservation.start_time.strftime("%I:%M %p")} to {reservation.end_time.strftime("%I:%M %p")} is submitted.\n\n' \
              f'To cancel this booking visit:\n{cancellation_url}\n\n' \
              f'Thank you for reserving with our system!'
    from_email = 'reservations@yourstudyrooms.com'
    recipient_list = [student_email]

    if student_email != '[Student Email Missing]':
        send_mail(subject, message, from_email, recipient_list, fail_silently=True)
    else:
        print(f"Warning: Could not send confirmation email for reservation {reservation.id}, student email missing.")


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'name', 'email']

class StudyRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyRoom
        fields = ['id', 'room_number', 'floor']

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
        many=True,
        style={'base_template': 'checkbox_multiple.html'} 
    )
    student = serializers.SlugRelatedField(
        queryset=Student.objects.all(),
        slug_field='student_id' 
    )

    study_room = serializers.PrimaryKeyRelatedField(queryset=StudyRoom.objects.all())
    date = serializers.DateField()
    start_time = serializers.TimeField(format='%I:%M %p', read_only=True)  
    end_time = serializers.TimeField(format='%I:%M %p', read_only=True)  

    class Meta:
        model = Reservation
        fields = ['id', 'student', 'study_room', 'timeslots', 'date', 'status', 'start_time', 'end_time', 'created_at']
        read_only_fields = ['start_time', 'end_time', 'created_at', 'status']


    def validate_timeslots(self, value):
        """
        Validates the list of timeslots provided.
        """
        if not value:
            raise DRFValidationError("Please select at least one timeslot.")
        if len(value) > MAX_TIMESLOTS:
            raise serializers.ValidationError(f"Maximum reservation duration is {MAX_RESERVATION_HOURS} hours (max {MAX_TIMESLOTS} timeslots).")

        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate timeslots are not allowed.")

        sorted_timeslots = sorted(list(value), key=lambda ts: ts.start_time) 

        previous_timeslot = None
        for current_timeslot in sorted_timeslots:
            if previous_timeslot:
                if current_timeslot.start_time < previous_timeslot.end_time:
                     raise serializers.ValidationError("Timeslots must be consecutive and correctly ordered.")
                if current_timeslot.start_time != previous_timeslot.end_time:
                    raise serializers.ValidationError("Timeslots must be strictly consecutive (e.g., 9:00-9:30 followed by 9:30-10:00).")

            previous_timeslot = current_timeslot

        return sorted_timeslots

    def validate(self, data):
        """
        Combined validation including timeslot-specific checks and overall reservation validation,
        including room availability check.
        """
        timeslots = data.get('timeslots')
        study_room = data.get('study_room')
        date = data.get('date')

        if timeslots:
            if study_room and date:
                for timeslot in timeslots:
                    room_overlap_reservations = Reservation.objects.filter(
                        study_room=study_room,
                        date=date,
                        timeslots=timeslot, 
                        status__in=['confirmed', 'pending'] 
                    )
                    if room_overlap_reservations.exists():
                        start_time_12hr = timeslot.start_time.strftime('%I:%M %p').lstrip('0')
                        end_time_12hr = timeslot.end_time.strftime('%I:%M %p').lstrip('0')
                        timeslot_str_12hr = f"{start_time_12hr} - {end_time_12hr}"

                        raise serializers.ValidationError(
                            f"This study room is already reserved for the timeslot: {timeslot_str_12hr}.")

        return data

    def create(self, validated_data):
        """Creates a Reservation instance with multiple timeslots and sends confirmation email."""

        timeslots = validated_data.pop('timeslots')

        sorted_timeslots = sorted(list(timeslots), key=lambda ts: ts.start_time)

        reservation = Reservation(**validated_data) 

        reservation.start_time = sorted_timeslots[0].start_time
        reservation.end_time = sorted_timeslots[-1].end_time

        reservation.save()
        print(f"Reservation created and saved, ID: {reservation.id}")

        reservation.timeslots.set(sorted_timeslots)
        print(f"Timeslots set successfully, Reservation ID: {reservation.id}")

        confirmation_url = self.context['request'].build_absolute_uri(
            reverse('reservation-confirm', kwargs={'pk': reservation.pk})
        )
        cancellation_url = self.context['request'].build_absolute_uri(
            reverse('reservation-cancel', kwargs={'pk': reservation.pk})
        )

        send_reservation_confirmation_email(reservation, confirmation_url, cancellation_url)

        return reservation


    def update(self, instance, validated_data):
        """Updates a Reservation instance including timeslots."""
        timeslots_data = validated_data.pop('timeslots', None) 


        instance.student = validated_data.get('student', instance.student) 
        instance.study_room = validated_data.get('study_room', instance.study_room)
        instance.date = validated_data.get('date', instance.date)
        instance.status = validated_data.get('status', instance.status)

        if timeslots_data is not None: 
            sorted_timeslots_data = sorted(list(timeslots_data), key=lambda ts: ts.start_time)
            instance.timeslots.set(sorted_timeslots_data)

            if instance.timeslots.exists():
                 earliest_start = instance.timeslots.earliest('start_time').start_time
                 latest_end = instance.timeslots.latest('end_time').end_time
                 instance.start_time = earliest_start
                 instance.end_time = latest_end
            else:
                instance.start_time = None
                instance.end_time = None
        elif instance.timeslots.exists():
             earliest_start = instance.timeslots.earliest('start_time').start_time
             latest_end = instance.timeslots.latest('end_time').end_time
             instance.start_time = earliest_start
             instance.end_time = latest_end

        instance.save()
        return instance