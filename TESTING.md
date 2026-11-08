# AgriYield AI - System Verification & Test Plan

This document outlines the end-to-end testing matrix for the **AgriYield AI** decision support system developed for smallholder Irish Potato and Tomato farmers in Jos South, Plateau State, Nigeria.

---

## 1. Automated Test Suite (pytest)

Run the backend unit test suite:
```bash
cd ml-api
pytest -v
```

### Automated Test Coverage Summary
| Test Case | Target Module | Scope | Status |
| :--- | :--- | :--- | :--- |
| `test_health` | `ml-api/main.py` | Checks service health and model loading flags | **PASSED** |
| `test_models_endpoint` | `ml-api/main.py` | Verifies metadata & 13 supported Solanaceae classes | **PASSED** |
| `test_crop_prediction_validation` | `ml-api/routers/crop.py` | Validates Pydantic schema & negative pH rejection | **PASSED** |
| `test_fertilizer_prediction` | `ml-api/routers/fertilizer.py` | Validates nutrient gap analysis output | **PASSED** |
| `test_yield_prediction` | `ml-api/routers/yield_pred.py` | Checks BiLSTM forecast in kg/acre and tips | **PASSED** |
| `test_sensor_ingestion` | `ml-api/routers/sensors.py` | Verifies hardware packet ingestion & device key | **PASSED** |
| `test_potato_low_nitrogen` | `ml-api/services/fertilizer_service.py` | Verifies Urea/CAN fertilizer advice for potato | **PASSED** |
| `test_potato_high_nitrogen` | `ml-api/services/fertilizer_service.py` | Verifies nitrogen cessation advice | **PASSED** |
| `test_tomato_low_potassium` | `ml-api/services/fertilizer_service.py` | Verifies MOP/wood ash advice for tomato | **PASSED** |
| `test_tomato_balanced` | `ml-api/services/fertilizer_service.py` | Verifies optimal nutrient balanced status | **PASSED** |
| `test_low_phosphorus` | `ml-api/services/fertilizer_service.py` | Verifies SSP/DAP application advice | **PASSED** |

---

## 2. Farmer & Admin User Acceptance Test Matrix

| # | Feature / Test Scenario | Action / Input Steps | Expected Outcome | Verification |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Farmer Registration** | Go to `/register`. Fill Name (*Bitrus Pam*), Phone (*08031234567*), Village (*Vom*), Soil (*Loamy Acidic Highland*), Crops (*Potato*). Click *Detect Farm GPS*. Submit. | User is registered, saved to Firestore, and redirected to `/home` with greeting. | Verified |
| **2** | **Farmer Login** | Go to `/login`. Click *Quick Demo: Farmer (Bitrus, Vom)* or enter credentials. | Farmer dashboard opens showing Vom weather card and big action buttons. | Verified |
| **3** | **Invalid Login** | Go to `/login`. Enter invalid email/password (e.g. `bad@wrong.com` / `123`). | Toast displays authentication error; access blocked. | Verified |
| **4** | **Crop Recommendation** | Go to `/crop-recommendation`. Form loads auto-fetched Jos South weather. Click *Autofill from Sensor*. Submit. | Top 3 crops ranked with confidence bars. Explains suitability for Jos South. | Verified |
| **5** | **Fertilizer Suggestion** | Go to `/fertilizer`. Select *Irish Potato*. Enter N: 60, P: 85, K: 165. Click *Get Precision Advice*. | Returns *N_low (Nitrogen Deficient)*. Advises Urea / CAN application with Hausa action. | Verified |
| **6** | **Disease Detection (Good Photo)** | Go to `/disease-detection`. Upload or snap leaf photo showing Early/Late Blight lesions. Click *Diagnose*. | Returns disease name, confidence (85-98%), severity badge, organic and chemical remedies. | Verified |
| **7** | **Disease Detection (Blurry Photo)** | Go to `/disease-detection`. Upload an out-of-focus or tiny thumbnail (&lt;80px or low variance). | System catches low quality: displays *Retake Photo Needed* banner in English & Hausa. | Verified |
| **8** | **Yield Prediction** | Go to `/yield-prediction`. Select *Potato*, Farm size: *2.5 acres*, Soil moisture: *55%*. Submit. | Predicts kg/acre (e.g. ~7,800 kg/acre), total kg, benchmark comparison, and tips. | Verified |
| **9** | **Reports & PDF Download** | Go to `/reports`. View 30-day history. Click *PDF* on any record. Click *Combined Farm Health Report*. | Client-side jsPDF compiles branded advisory PDF with tables and downloads immediately. | Verified |
| **10** | **Offline Mode & Sync** | 1. Turn off WiFi / toggle DevTools Offline.<br>2. App header shows *Offline* pill.<br>3. Open `/reports` - records viewable.<br>4. Run prediction - shows *Saved to device*.<br>5. Reconnect network. | Pending predictions auto-sync to backend, sync badge counts down to 0, toast confirms sync. | Verified |
| **11** | **Language Switch (Hausa)** | Tap *Language* button in Navbar. Select *Hausa*. | All UI headers, form labels, advice, and tips switch to fluent Hausa translations. | Verified |
| **12** | **Read Aloud (Voice)** | Click the speaker button (*Read Aloud*) on any diagnosis or yield result. | Web Speech API speaks the diagnostic summary aloud. Button animates and stops when tapped. | Verified |
| **13** | **Admin Dashboard** | Click *Quick Demo: Extension Admin* or navigate to `/admin`. | View Total Farmers (142), Disease frequency bar chart, Crop distribution pie chart, Model stats. | Verified |
| **14** | **Deactivate Farmer User** | Go to `/admin/users`. Locate farmer row. Click *Deactivate*. | Status changes to *deactivated*. If farmer tries logging in, access is denied. | Verified |
| **15** | **IoT Sensor Telemetry** | Run `python iot-simulator/simulator.py --village Vom`. Check `/sensors`. | Live soil moisture and temperature packets received; Recharts line graph updates dynamically. | Verified |
