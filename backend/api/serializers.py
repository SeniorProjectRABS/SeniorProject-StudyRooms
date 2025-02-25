from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Student, StudyRoom, Reservation

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email']

class StudyRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyRoom
        fields = ['room_number']

class ReservationSerializer(serializers.ModelSerializer):
    # Optionally, you can show nested representations for student and study room
    # student = StudentSerializer(read_only=True)
    # study_room = StudyRoomSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = ['student', 'study_room', 'start_time', 'end_time', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        """
        Use the model's clean() method to enforce business rules such as operating hours,
        maximum duration, and overlapping reservation checks.
        """
        # For update operations, include the instance's pk
        reservation = Reservation(**data)
        if self.instance:
            reservation.pk = self.instance.pk

        try:
            reservation.clean()
        except ValidationError as e:
            # e.message_dict returns a dictionary of errors
            raise serializers.ValidationError(e.message_dict)

        return data
