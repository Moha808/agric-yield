# AgriYield AI: Decision Support System for Jos South Smallholders

**AgriYield AI** is an intelligent full-stack web application and Progressive Web App (PWA) developed to enhance agricultural yields for smallholder **Irish Potato** (*Solanum tuberosum*) and **Tomato** (*Solanum lycopersicum*) farmers in **Jos South Local Government Area, Plateau State, Nigeria** (Vom, Bukuru, Du, Gyel, Tudun Wada, Zawan, Kwata, Shen, and Kuru).

---

## System Overview & Agronomic Scope

Smallholder farmers in Jos South face severe crop losses (20–40%) from Late Blight (*Phytophthora infestans*), nutrient deficiencies, and unpredictable rainfall patterns. AgriYield AI provides:
1. **Foliar Disease Diagnosis:** Transfer learning CNN (MobileNetV2) trained on 13 Solanaceae classes with organic and chemical remedies.
2. **Crop Suitability Recommendation:** Random Forest classifier matching soil chemistry (N, P, K, pH) and Jos South elevation/weather to suitable crops.
3. **Precision Fertilizer Balancing:** Nutrient gap analysis comparing current soil tests against optimal potato/tomato requirements.
4. **BiLSTM Harvest Yield Forecasting:** Time-series yield regressor forecasting kg per acre and kg per hectare with agronomic improvement tips.
5. **IoT Sensor Ingestion & Resource Advice:** Live telemetry (soil moisture, soil temperature, air temperature, humidity) and smart irrigation guidance.
6. **Bilingual Accessibility:** 100% English and Hausa translations (`react-i18next`) plus Web Speech API voice read-aloud buttons.
7. **Offline-First PWA:** Full service worker caching, IndexedDB/localStorage 30-day report archive, and automatic background queue synchronization.

---

## Architecture

```
├── frontend/             # React (Vite) + Tailwind CSS + PWA (Mobile-first)
│   ├── src/
│   │   ├── components/   # Navbar, Footer, WeatherCard, SpeechButton, RatingModal
│   │   ├── context/      # AuthContext (Role-based), OfflineSyncContext (Queue)
│   │   ├── firebase/     # Firestore with Multi-Tab Offline Persistence
│   │   ├── hooks/        # useSpeechReader (Web Speech API with Hausa fallback)
│   │   ├── i18n/         # Complete English & Hausa dictionaries
│   │   ├── pages/        # Public, Farmer, and Admin Portals
│   │   └── services/     # mlApi client, reportService (Client-side PDF)
├── ml-api/               # Python FastAPI REST Service
│   ├── data/             # crop_requirements.csv
│   ├── models/           # Exported joblib models & genuine metrics
│   ├── routers/          # /predict/disease, /crop, /fertilizer, /yield, /api/sensors
│   ├── services/         # model_service, disease_service, fertilizer_service
│   ├── tests/            # pytest unit test suite (11 test cases)
│   └── Dockerfile        # Container specification for Render / Hugging Face Spaces
├── ml-training/          # Model training pipelines & synthetic Plateau datasets
│   ├── train_crop.py     # Random Forest training script
│   ├── train_yield.py    # BiLSTM / Regressor training script
│   ├── train_disease.py  # MobileNetV2 transfer learning pipeline
│   └── generate_demo_models.py # Generates active model weights & metadata
├── iot-simulator/        # IoT hardware node simulator (Raspberry Pi / ESP32)
│   └── simulator.py
├── firestore.rules       # Cloud Firestore security rules
├── storage.rules         # Firebase Storage security rules
├── seed_demo_data.py     # Script to populate demo farmers, predictions, & sensors
├── TESTING.md            # Complete verification and test execution matrix
└── README.md
```

---

## Quickstart (Local Development)

### 1. Start the Python ML API
```bash
# In project root
pip install -r ml-api/requirements.txt

# Train models & generate metadata (if not already trained)
python ml-training/generate_demo_models.py

# Run backend API
cd ml-api
uvicorn main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Start the Frontend (Vite PWA)
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
- Open browser: `http://localhost:5173`

---

## Environment Variables

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_ML_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=agriyield-ai-jos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=agriyield-ai-jos
VITE_FIREBASE_STORAGE_BUCKET=agriyield-ai-jos.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Note: If Firebase credentials are not yet configured, AgriYield AI automatically activates its robust local demo storage mode with full farmer and admin functionality!)*

### ML API (`ml-api/.env`)
Copy `ml-api/.env.example` to `ml-api/.env`:
```env
PORT=8000
IOT_DEVICE_KEY=agri_yield_jos_secret_2026
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_optional
```

---

## Creating the First Extension Admin

1. Open `http://localhost:5173/login`
2. Click the yellow button: **"Quick Demo: Extension Admin Portal"**
   - Alternatively, register an account with `admin@agriyield.ng` or set `role: "admin"` on your farmer profile document in Firestore:
   ```json
   {
     "farmerId": "<your_uid>",
     "role": "admin",
     "village": "Bukuru",
     "status": "active"
   }
   ```
3. The top navbar will display the **Admin** shield link granting access to `/admin`, `/admin/users`, `/admin/models`, `/admin/reports`, and `/admin/feedback`.

---

## Running IoT Simulator

To simulate a solar-powered Raspberry Pi or ESP32 probe in Vom sending continuous soil telemetry:
```bash
python iot-simulator/simulator.py --village Vom --interval 10 --drift
```
Open `http://localhost:5173/sensors` to watch real-time soil moisture and temperature updates on the interactive Recharts line graph!

---

## Seeding Demo Data

To populate demo farmers across Vom, Bukuru, Du, Gyel, sample blights, and 24-hour telemetry:
```bash
python seed_demo_data.py
```
To seed directly into your live Firebase Cloud Firestore:
```bash
python seed_demo_data.py --key path/to/serviceAccountKey.json
```

---

## Running Automated Tests

Run the full pytest test suite covering fertilizer logic, input boundary validations, and endpoints:
```bash
cd ml-api
pytest -v
```

---

## Deployment Instructions

### A. Deploy Frontend to Vercel
1. Push repository to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `frontend`.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Add Environment Variables:
   - `VITE_ML_API_URL`: Your deployed ML API URL.
   - `VITE_FIREBASE_*`: Your Firebase project keys.
5. Deploy.

### B. Deploy ML API to Render or Hugging Face Spaces

#### Render:
1. Create a **New Web Service** pointing to the repository.
2. Root Directory: `ml-api`.
3. Runtime: **Docker** (using `ml-api/Dockerfile`) or **Python 3.11**.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

#### Hugging Face Spaces:
1. Create a new Space with the **Docker** or **FastAPI** SDK.
2. Push the contents of `/ml-api` to the Space repository.
3. The Space will automatically build using `Dockerfile` and expose port `8000` / `7860`.
