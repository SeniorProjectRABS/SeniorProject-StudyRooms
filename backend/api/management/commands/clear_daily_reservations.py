from django.core.management.base import BaseCommand
from api.models import Reservation
from datetime import date, timedelta

class Command(BaseCommand):
    # Clears out reservations from the previous day to reset daily availability

    def handle(self, *args, **options):
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Delete reservations from yesterday
        deleted_reservations = Reservation.objects.filter(date=yesterday)
        count = deleted_reservations.count()
        deleted_reservations.delete()

        self.stdout.write(self.style.SUCCESS(f'Successfully cleared {count} reservations from {yesterday}!'))