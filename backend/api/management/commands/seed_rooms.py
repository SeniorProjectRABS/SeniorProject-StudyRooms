from django.core.management import BaseCommand

from api.models import StudyRoom


class Command(BaseCommand):
    # Seeds the database with StudyRoom objects for daily slots from 9 AM to 5 PM, IF NO TIMESLOTS EXIST YET'

    def handle(self, *args, **options):
        # Check if any StudyRoom objects already exist
        if StudyRoom.objects.exists():
            self.stdout.write(self.style.WARNING('Study Rooms already exist in the database. Skipping seeding.'))
            return  # Exit the command without creating new time slots

        rooms_created = 0
        study_rooms = [
            '1.203',
            '1.205',
            '2.203',
            '2.205',
            '3.205',
        ]

        for i,v in enumerate(study_rooms):
            floor_name = 'N/A'
            first_digit = v[0]  # Get the first character of the room number
            if first_digit.isdigit():  # Check if the first character is a digit
                floor_digit = int(first_digit)  # Convert the first character to an integer
                if floor_digit == 1:
                    floor_name = '1st'
                elif floor_digit == 2:
                    floor_name = '2nd'
                elif floor_digit == 3:
                    floor_name = '3rd'

            study_room, created = StudyRoom.objects.get_or_create(
                room_number=v,
                defaults={'floor': floor_name}  # Set floor using defaults
            )
            if created:
                rooms_created += 1

        if rooms_created > 0: # Only show success if slots were actually created
            self.stdout.write(self.style.SUCCESS(f'Successfully created {rooms_created} StudyRoom Objects!'))
        else:
            self.stdout.write(self.style.SUCCESS('No new Rooms created (Rooms already existed).'))
