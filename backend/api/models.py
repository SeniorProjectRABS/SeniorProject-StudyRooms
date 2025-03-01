from django.db import models
from django.core.exceptions import ValidationError
import datetime
from datetime import date

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.name} ({self.student_id})"


class StudyRoom(models.Model):
    # Storing room identifiers as strings (e.g., "1.001" for floor 1, room 001)
    room_number = models.CharField(max_length=5, unique=True)
    floor = models.CharField(max_length=5)

    def __str__(self):
        return f"{self.room_number} - {self.floor} Floor"

class TimeSlot(models.Model):
    start_time = models.TimeField(help_text="Start time of the time slot (e.g., 09:00)")
    end_time = models.TimeField(help_text="End time of the time slot (e.g., 09:30)")

    def __str__(self):
        start_time_12hr = self.start_time.strftime('%I:%M %p').lstrip('0') # Format start time to 12-hour
        end_time_12hr = self.end_time.strftime('%I:%M %p').lstrip('0')   # Format end time to 12-hour
        return f"{start_time_12hr} - {end_time_12hr}" # Return 12-hour formatted string


    def clean(self):
        duration = (datetime.datetime.combine(datetime.date.today(), self.end_time) -
                    datetime.datetime.combine(datetime.date.today(), self.start_time)).total_seconds() / 60.0
        if duration > 90: # 1.5 hours in minutes
            raise ValidationError("Time slot duration cannot exceed 1.5 hours.")
        if duration <= 0:
            raise ValidationError("Time slot duration must be positive.")
        if self.start_time < datetime.time(9, 0) or self.end_time > datetime.time(17, 0): # 9 AM to 5 PM
            raise ValidationError("Time slots must be within operating hours (9 AM to 5 PM).")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Reservation(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="reservations")
    study_room = models.ForeignKey(StudyRoom, on_delete=models.CASCADE, related_name="reservations")
    timeslots = models.ManyToManyField(TimeSlot, related_name='reservations') # Changed to ManyToManyField
    start_time = models.TimeField(null=True, blank=True, help_text="Start time of the entire reservation block (derived from timeslots)") # Added overall start_time
    end_time = models.TimeField(null=True, blank=True, help_text="End time of the entire reservation block (derived from timeslots)")   # Added overall end_time
    date = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # Added status field


    def clean(self):
        print("Entering Reservation.clean()")
        selected_timeslots = self.timeslots.all()
        if self._state.adding and not selected_timeslots:
            raise ValidationError("A reservation must include at least one timeslot.")
        print("Exiting Reservation.clean()")
        super().clean()

    def save(self, *args, **kwargs):
        try:
            super().save(*args, **kwargs)  # Save first to get an ID
            self.clean()
        except ValidationError as e:
            print(f"ValidationError in Reservation.save(): {e}")  # Debugging print for validation errors
            raise

    def __str__(self):
        return (f"{self.student} reserved {self.study_room} on {self.date}")