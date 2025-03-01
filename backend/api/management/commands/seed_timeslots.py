from django.core.management.base import BaseCommand
from api.models import TimeSlot  # Replace 'your_app'
from datetime import time, timedelta, datetime, date

class Command(BaseCommand):
    # Seeds the database with TimeSlot objects for daily slots from 9 AM to 5 PM, IF NO TIMESLOTS EXIST YET'

    def handle(self, *args, **options):
        # Check if any TimeSlot objects already exist
        if TimeSlot.objects.exists():
            start_hour_12hr = datetime.strptime(str(9), "%H").strftime("%I %p").lstrip('0') # Convert 9 to "9 AM"
            end_hour_12hr = datetime.strptime(str(17), "%H").strftime("%I %p").lstrip('0')   # Convert 17 to "5 PM"
            self.stdout.write(self.style.WARNING(f'Time slots already exist in the database. Skipping seeding of time slots from {start_hour_12hr} to {end_hour_12hr}.'))
            return  # Exit the command without creating new time slots

        start_hour = 9
        end_hour = 17  # 5 PM
        time_interval = timedelta(minutes=30)

        current_time = datetime.combine(date.today(), time(start_hour, 0))
        end_time_day = datetime.combine(date.today(), time(end_hour, 0))

        timeslots_created_count = 0
        while current_time < end_time_day:
            slot_start_time = current_time.time()
            slot_end_time = (current_time + time_interval).time()

            timeslot, created = TimeSlot.objects.get_or_create(
                start_time=slot_start_time,
                end_time=slot_end_time
            )
            if created:
                timeslots_created_count += 1

            current_time += time_interval

        if timeslots_created_count > 0: # Only show success if slots were actually created
            start_hour_12hr = datetime.strptime(str(9), "%H").strftime("%I %p").lstrip('0') # Convert 9 to "9 AM"
            end_hour_12hr = datetime.strptime(str(17), "%H").strftime("%I %p").lstrip('0')   # Convert 17 to "5 PM"
            self.stdout.write(self.style.SUCCESS(f'Successfully created {timeslots_created_count} TimeSlot objects from {start_hour_12hr} to {end_hour_12hr}!'))
        else:
            self.stdout.write(self.style.SUCCESS('No new time slots created (time slots already existed).'))