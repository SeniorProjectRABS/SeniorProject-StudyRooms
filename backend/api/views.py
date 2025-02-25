from django.shortcuts import render

from datetime import datetime, timedelta
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import TimeSlotSerializer
from .models import TimeSlot  
from django.utils import timezone


@api_view(['GET'])
def get_time_slots(request):
    start_time = timezone.now().replace(hour=8, minute=0, second=0, microsecond=0)
    time_slots = []
    for _ in range(22):  # 8:00 AM to 6:30 PM (22 slots of 30 mins)
        # Check if a TimeSlot object already exists for this time
        timeslot, created = TimeSlot.objects.get_or_create(start_time=start_time)
        time_slots.append(timeslot)
        start_time += timedelta(minutes=30)

    serializer = TimeSlotSerializer(time_slots, many=True)
    return Response(serializer.data)