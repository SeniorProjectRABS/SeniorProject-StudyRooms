from django.contrib import admin
from .models import Student, Reservation, StudyRoom, TimeSlot 

admin.site.register(Student)

@admin.register(StudyRoom) 
class StudyRoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'floor', 'image') 

admin.site.register(Reservation)
admin.site.register(TimeSlot)