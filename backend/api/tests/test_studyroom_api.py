import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from .conftest import StudyRoomFactory

User = get_user_model()

@pytest.mark.django_db
class TestStudyRoomAPI:
    list_url = reverse("studyroom-list")

    @pytest.fixture(autouse=True)
    def login_admin(self, client):
        # create a superuser (or staff user, whichever your permissions require)
        admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="pass123"
        )
        # tell DRF’s test client “I’m authenticated as that user”
        client.force_authenticate(user=admin)
        return client

    def test_create_and_list(self, client):
        payload = {"room_number": "B‑201", "floor": "2"}
        resp = client.post(self.list_url, payload)       # now you’re logged in
        assert resp.status_code == 201
        data = client.get(self.list_url).json()
        assert any(r["room_number"] == "B‑201" for r in data)

    def test_update_blocked(self, client):
        room = StudyRoomFactory()
        detail_url = reverse("studyroom-detail", args=[room.pk])
        resp = client.patch(detail_url, {"floor": "9"})
        assert resp.status_code == 403          # NoUpdateDelete in action

    def test_delete_blocked(self, client):
        room = StudyRoomFactory()
        detail_url = reverse("studyroom-detail", args=[room.pk])
        resp = client.delete(detail_url)
        assert resp.status_code == 403
