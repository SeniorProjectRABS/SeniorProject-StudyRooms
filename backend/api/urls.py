from django.urls import path
from . import views

urlpatterns = [
    path('time-slots/', views.get_time_slots, name='get_time_slots'),
]
