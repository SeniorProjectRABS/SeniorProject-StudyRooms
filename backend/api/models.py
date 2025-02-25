from django.db import models



class TimeSlot(models.Model):
    start_time = models.DateTimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.start_time.strftime('%I:%M %p')} - {self.is_available}"



