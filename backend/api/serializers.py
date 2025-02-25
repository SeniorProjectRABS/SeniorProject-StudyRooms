from rest_framework import serializers
from .models import TimeSlot

class TimeSlotSerializer(serializers.ModelSerializer):
    time_label = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = ['time_label', 'is_available']

    def get_time_label(self, obj):
        return obj.start_time.strftime('%I:%M %p')