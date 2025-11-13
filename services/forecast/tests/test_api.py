from fastapi.testclient import TestClient
from app.main import app


def test_sample_endpoint():
    client = TestClient(app)
    r = client.get('/forecast/sample')
    assert r.status_code == 200
    data = r.json()
    assert 'series' in data
