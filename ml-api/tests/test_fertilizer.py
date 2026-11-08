import pytest
from services.fertilizer_service import analyze_fertilizer

def test_potato_low_nitrogen():
    result = analyze_fertilizer("potato", n=50.0, p=90.0, k=170.0)
    assert result["crop"] == "potato"
    assert result["status_key"] == "N_low"
    assert "Urea" in result["action"] or "CAN" in result["action"]
    assert "hausa_action" in result

def test_potato_high_nitrogen():
    result = analyze_fertilizer("potato", n=220.0, p=90.0, k=170.0)
    assert result["crop"] == "potato"
    assert result["status_key"] == "N_high"
    assert "Stop" in result["action"] or "excess" in result["summary"].lower()

def test_tomato_low_potassium():
    # Tomato ideal K is 120, min is 90
    result = analyze_fertilizer("tomato", n=115.0, p=70.0, k=40.0)
    assert result["crop"] == "tomato"
    assert result["status_key"] == "K_low"
    assert "Potash" in result["action"] or "ash" in result["action"].lower()

def test_tomato_balanced():
    # Tomato within optimal range
    result = analyze_fertilizer("tomato", n=115.0, p=70.0, k=120.0)
    assert result["crop"] == "tomato"
    assert result["status_key"] == "balanced"
    assert "Balanced" in result["title"]

def test_low_phosphorus():
    result = analyze_fertilizer("potato", n=130.0, p=30.0, k=170.0)
    assert result["status_key"] == "P_low"
    assert "SSP" in result["action"] or "DAP" in result["action"]
