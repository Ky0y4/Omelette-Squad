from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

def test_analyze_missing_description():
    response = client.post("/analyze", data={"timestamp": "2026-01-01T00:00:00Z"})
    assert response.status_code == 422  

def test_analyze_invalid_file_type():
    response = client.post(
        "/analyze",
        data={"description": "test", "timestamp": "2026-01-01T00:00:00Z"},
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400

@patch("main.get_response")
def test_analyze_success(mock_get_response):
    mock_get_response.return_value = {
        "summary": "Test summary",
        "top_careers": []
    }
    response = client.post(
        "/analyze",
        data={"description": "I am a CS student", "timestamp": "2026-01-01T00:00:00Z"},
    )
    assert response.status_code == 200
    assert "summary" in response.json()

def test_read_pdf_invalid():
    from readFiles import readPDF
    try:
        readPDF(b"not a pdf")
        assert False, "Should have raised"
    except Exception:
        pass

def test_load_datasets():
    from loadData import DATASETS
    assert isinstance(DATASETS, dict)
