from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_incident():
    data = {
        "service": "test-service",
        "severity": "low",
        "error": "Test error",
        "description": "Test desc",
        "environment": "test"
    }
    response = client.post("/api/incidents", json=data)
    assert response.status_code == 200
    assert "incident_id" in response.json()
