# backend/api/tests/test_reservation_api.py
import pytest
from django.urls import reverse
from api.models import Reservation
from .conftest import (
    StudyRoomFactory,
    StudentFactory,
    TimeSlotFactory,
)


@pytest.mark.django_db
class TestReservationAPI:
    list_url = reverse("reservation-list")

    def _payload(self):
        room = StudyRoomFactory()
        student = StudentFactory()
        ts1, ts2 = TimeSlotFactory(), TimeSlotFactory()  # consecutive 30‑min slots
        return {
            "student": student.student_id,
            "study_room": room.id,
            "timeslots": [ts1.id, ts2.id],
            "date": "2025-04-30",
        }

    def test_create_success(self, client):
        resp = client.post(self.list_url, self._payload(), format="json")
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "pending"
        # overall start & end times derived from timeslots
        assert data["start_time"]
        assert data["end_time"]

    def test_overlap_rejected(self, client):
        # first reservation succeeds
        payload = self._payload()
        resp1 = client.post(self.list_url, payload, format="json")
        assert resp1.status_code == 201

        # second reservation with *same* room/date/one overlapping slot
        payload2 = payload.copy()
        resp2 = client.post(self.list_url, payload2, format="json")
        assert resp2.status_code == 400
        assert "already reserved" in resp2.json()["non_field_errors"][0].lower()

    def test_update_blocked(self, client):
        resp = client.post(self.list_url, self._payload(), format="json")
        reservation_id = resp.json()["id"]
        detail_url = reverse("reservation-detail", args=[reservation_id])
        resp2 = client.patch(detail_url, {"status": "cancelled"})
        assert resp2.status_code == 403

    def test_delete_blocked(self, client):
        resp = client.post(self.list_url, self._payload(), format="json")
        reservation_id = resp.json()["id"]
        detail_url = reverse("reservation-detail", args=[reservation_id])
        resp2 = client.delete(detail_url)
        assert resp2.status_code == 403

    def test_confirm_and_cancel_custom_views(self, client):
        # create pending reservation
        resp = client.post(self.list_url, self._payload(), format="json")
        reservation_id = resp.json()["id"]

        confirm_url = reverse("reservation-confirm", args=[reservation_id])
        cancel_url = reverse("reservation-cancel", args=[reservation_id])

        resp_c = client.get(confirm_url)
        assert resp_c.status_code in (200, 302)  # depends on your view’s design

        resp_x = client.get(cancel_url)
        assert resp_x.status_code in (200, 302)
