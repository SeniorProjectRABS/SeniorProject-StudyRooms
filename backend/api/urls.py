from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

from .views import TimeSlotViewSet, StudyRoomViewSet, StudentViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r'timeslots', TimeSlotViewSet, basename='timeslot')
router.register(r'studyrooms', StudyRoomViewSet, basename='studyroom')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path('reservations/confirm/<int:reservation_id>/', views.reservation_confirm_view, name='reservation-confirm'),
    path('reservations/cancel/<int:reservation_id>/', views.reservation_cancel_view, name='reservation-cancel'),
]
