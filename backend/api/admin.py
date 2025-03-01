from django.contrib import admin

from api.models import Student, Reservation, StudyRoom, TimeSlot

# Register your models here.
admin.site.register(Student)
admin.site.register(StudyRoom)
admin.site.register(Reservation)
admin.site.register(TimeSlot)