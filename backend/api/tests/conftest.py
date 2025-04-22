# backend/api/tests/conftest.py
import pytest
from rest_framework.test import APIClient
from api.models import StudyRoom, TimeSlot, Student
from django.utils import timezone
import factory


@pytest.fixture
def client():
    return APIClient()


# ----- factories -----------------------------------------------------
class StudyRoomFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudyRoom

    room_number = factory.Sequence(lambda n: f"A-{n:03}")
    floor = "1"


class StudentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Student

    student_id = factory.Sequence(lambda n: f"S{n:04}")
    name = factory.Faker("name")
    email = factory.LazyAttribute(lambda o: f"{o.student_id}@example.com")


class TimeSlotFactory(factory.django.DjangoModelFactory):
    """
    Creates consecutive 30‑minute slots starting at 09:00.
    """
    class Meta:
        model = TimeSlot

    @factory.sequence
    def start_time(n):
        base = timezone.datetime(2000, 1, 1, 9, 0).time()
        delta = timezone.timedelta(minutes=30 * n)
        return (timezone.datetime.combine(timezone.now(), base) + delta).time()

    @factory.lazy_attribute
    def end_time(self):
        return (timezone.datetime.combine(timezone.now(), self.start_time) +
                timezone.timedelta(minutes=30)).time()
