"""Public plan reads and CORS for the renamed production frontend."""
from bson import ObjectId
from fastapi.testclient import TestClient
import main
import auth


def test_plans_uses_only_active_database_records(monkeypatch):
    calls = []
    identifier = ObjectId()

    class Plans:
        def find(self, query):
            calls.append(query)
            return [{"_id": identifier, "name": "Test plan", "price": 42,
                     "includedUnits": 100, "costPerUnit": 0.42, "isActive": True}]

    monkeypatch.setattr(auth, "plans_collection", Plans())
    response = TestClient(main.app).get('/api/plans', headers={
        'Origin': 'https://versa-workspace.vercel.app',
    })
    assert response.status_code == 200
    assert calls == [{"isActive": True}]
    assert response.json()[0]['_id'] == str(identifier)
    assert response.json()[0]['price'] == 42
    assert response.headers['access-control-allow-origin'] == 'https://versa-workspace.vercel.app'


def test_plans_empty_collection_does_not_invent_prices(monkeypatch):
    class Plans:
        def find(self, query):
            return []

    monkeypatch.setattr(auth, "plans_collection", Plans())
    response = TestClient(main.app).get('/api/plans')
    assert response.status_code == 200
    assert response.json() == []


def test_untrusted_origin_is_not_allowed(monkeypatch):
    monkeypatch.setattr(main, 'get_all_plans', lambda: [])
    response = TestClient(main.app).get('/api/plans', headers={'Origin': 'https://untrusted.invalid'})
    assert 'access-control-allow-origin' not in response.headers
