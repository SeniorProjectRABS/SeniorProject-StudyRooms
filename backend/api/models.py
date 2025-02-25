from django.db import models
from django.core.exceptions import ValidationError
import datetime

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.name} ({self.student_id})"


class StudyRoom(models.Model):
    # Storing room identifiers as strings (e.g., "1.001" for floor 1, room 001)
    room_number = models.CharField(max_length=5, unique=True)

    def __str__(self):
        return self.room_number


class Reservation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="reservations")
    study_room = models.ForeignKey(StudyRoom, on_delete=models.CASCADE, related_name="reservations")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validate reservation is within operating hours (9 AM to 5 PM)
        if self.start_time.time() < datetime.time(9, 0) or self.end_time.time() > datetime.time(17, 0):
            raise ValidationError("Reservations must be between 9 AM and 5 PM.")
        
        # Validate duration does not exceed 1.5 hours (90 minutes) and is positive
        duration = (self.end_time - self.start_time).total_seconds() / 60.0
        if duration > 90:
            raise ValidationError("Reservation duration cannot exceed 1.5 hours.")
        if duration <= 0:
            raise ValidationError("Reservation duration must be positive.")

        # Ensure the student doesn't have overlapping reservations
        overlapping = Reservation.objects.filter(
            student=self.student,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)
        if overlapping.exists():
            raise ValidationError("You already have a reservation overlapping with this time slot.")

        # Ensure the study room is not already reserved for this time slot
        room_overlap = Reservation.objects.filter(
            study_room=self.study_room,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )
        if self.pk:
            room_overlap = room_overlap.exclude(pk=self.pk)
        if room_overlap.exists():
            raise ValidationError("This study room is already reserved for the selected time slot.")

    def __str__(self):
        return (f"{self.student} reserved {self.study_room} from "
                f"{self.start_time.strftime('%I:%M %p')} to {self.end_time.strftime('%I:%M %p')}")
