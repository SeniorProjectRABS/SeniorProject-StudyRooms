from datetime import datetime

from django.core.mail import send_mail
from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q  # Import Q objects
from .utils.auth import NoUpdateDelete

from api.models import StudyRoom, Student, Reservation, TimeSlot
from api.serializers import StudyRoomSerializer, StudentSerializer, ReservationSerializer, TimeSlotSerializer

@api_view(['GET'])
def reservation_confirm_view(request, pk):
    """Confirms a reservation."""
    try:
        reservation = get_object_or_404(Reservation, pk=pk, status='pending')  # Get pending reservation
        reservation.status = 'confirmed'  # Update status to 'confirmed'
        reservation.save()

        subject = f'EIEAB Study Rooms {reservation.study_room.floor} Floor  Booking Confirmation'
        message = f'Hi {reservation.student.name},\n\n' \
                  'The following bookings have been confirmed: \n\n'\
                  'Reservation Information:\n'\
                  f'Location: EIEAB {reservation.study_room.floor} Floor\n' \
                  f'Space: EIEAB {reservation.study_room.room_number}\n' \
                  f'Date: {reservation.date.strftime("%A, %B %d, %Y")}\n'\
                  f'Time: {reservation.start_time.strftime("%I:%M %p")} - {reservation.end_time.strftime("%I:%M %p")}\n\n' \
                  f'Thank you for reserving with our system!'
        from_email = 'reservations@yourstudyrooms.com'
        recipient_list = [reservation.student.email]
        send_mail(subject, message, from_email, recipient_list, fail_silently=True)

        return Response(
            {'message': f'Reservation {pk} successfully confirmed!'})  # Confirmation message
    except Http404:
        return Response({'error': 'Invalid or already confirmed/cancelled reservation.'},
                        status=400)  # Error if not found or wrong status

@api_view(['GET'])
def reservation_cancel_view(request, pk):
    """Cancels a reservation."""
    try:
        reservation = get_object_or_404(
            Reservation,
            Q(status='pending') | Q(status='confirmed'),  # Q object for status conditions (positional argument)
            pk=pk  # pk filter (keyword argument)
        )
        reservation.status = 'cancelled'  # Update status to 'cancelled'
        reservation.save()
        subject = f'Booking Cancellation'
        message = f'Hi {reservation.student.name},\n\n' \
                  'The following bookings have been cancelled: \n\n' \
                  'Reservation Information:\n' \
                  f'Location: EIEAB {reservation.study_room.floor} Floor\n' \
                  f'Space: EIEAB {reservation.study_room.room_number}\n' \
                  f'Date: {reservation.date.strftime("%A, %B %d, %Y")}\n' \
                  f'Time: {reservation.start_time.strftime("%I:%M %p")} - {reservation.end_time.strftime("%I:%M %p")}\n\n' \
                  f'We are sorry for the inconvenience.\n' \
                  f'Thank you for reserving with our system!'
        # Eventually fix for actual emails
        from_email = 'reservations@yourstudyrooms.com'
        recipient_list = [reservation.student.email]
        send_mail(subject, message, from_email, recipient_list, fail_silently=True)
        return Response(
            {'message': f'Reservation {pk} successfully cancelled.'})  # Cancellation message
    except Http404:
        return Response({'error': 'Invalid or already confirmed/cancelled reservation.'},
                        status=400)  # Error if not found or wrong status

class TimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='date',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=True,
                description='Date for which to retrieve available time slots (YYYY-MM-DD)',
            ),
        ],
        responses={
            200: TimeSlotSerializer(many=True), # Document successful response
            400: { # Document error response
                'type': 'object',
                'properties': {
                    'error': {'type': 'string', 'description': 'Time Slots Not Found!'}
                },
            },
        }
    )
    @action(detail=False, methods=['get'], url_path='availability')
    def available_slots(self,request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"error": "Please provide a 'date' query parameter in YYYY-MM-DD format."}, status=400)
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Please use YYYY-MM-DD."}, status=400)

        all_time_slots = TimeSlot.objects.all()
        available_slots = []

        for time_slot in all_time_slots:
            if not Reservation.objects.filter(timeslots=time_slot, date=date).exists():
                available_slots.append(TimeSlotSerializer(time_slot).data)

        return Response(available_slots)

class StudyRoomViewSet(viewsets.ModelViewSet):  # allow create + list
    queryset = StudyRoom.objects.all()
    serializer_class = StudyRoomSerializer
    permission_classes = [NoUpdateDelete]         # GET/POST allowed; PUT/PATCH/DELETE denied

class StudentViewSet(viewsets.ModelViewSet): # Use ModelViewSet for CRUD operations
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated] # Adjust as needed

class ReservationViewSet(viewsets.ModelViewSet): # Use ModelViewSet for CRUD operations
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [NoUpdateDelete]

    def get_serializer_context(self):
        """Pass request to serializer for user context if needed."""
        return {'request': self.request}
