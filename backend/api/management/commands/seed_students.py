from django.core.management import BaseCommand

from api.models import Student


class Command(BaseCommand):
    # Seeds the database with Student objects for daily slots from 9 AM to 5 PM, IF NO TIMESLOTS EXIST YET'

    def handle(self, *args, **options):
        # Check if any Student objects already exist
        if Student.objects.count() > 1:
            self.stdout.write(self.style.WARNING('Students already exist in the database. Skipping seeding.'))
            return  # Exit the command without creating new time slots

        students_created = 0
        students = [
            {
                'student_id': '20448443',
                'name': 'Bradley Puga',
                'email': 'bradley.puga02@utrgv.edu',
            },
            {
                'student_id': '20312345',
                'name': 'Ruben Gonzalez',
                'email': 'ruben.gonzalez02@utrgv.edu',
            },
            {
                'student_id': '12345678',
                'name': 'Samantha Cadena',
                'email': 'samantha.cadena01@utrgv.edu',
            },
            {
                'student_id': '23112402',
                'name': 'Armamdo Vazquez',
                'email': 'armamdo.vazquez01@utrgv.edu',
            },
        ]

        for i,s in enumerate(students):
            student, created = Student.objects.get_or_create(
                student_id=s['student_id'],
                name=s['name'],
                email=s['email'],
            )

            if created:
                students_created += 1

        if students_created > 0: # Only show success if slots were actually created
            self.stdout.write(self.style.SUCCESS(f'Successfully created {students_created} StudyRoom Objects!'))
        else:
            self.stdout.write(self.style.SUCCESS('No new Rooms created (Rooms already existed).'))
