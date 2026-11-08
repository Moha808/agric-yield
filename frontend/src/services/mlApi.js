const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || import.meta.env.VITE_API_URL || 'https://agric-yield.onrender.com';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${ML_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`ML API call to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const mlApi = {
  // Crop Recommendation
  async predictCrop(data) {
    return await request('/predict/crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Fertilizer Recommendation
  async predictFertilizer(data) {
    return await request('/predict/fertilizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Disease Detection
  async predictDisease(imageBlob) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'leaf_photo.jpg');

    const res = await fetch(`${ML_API_BASE_URL}/predict/disease`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.error === 'LOW_IMAGE_QUALITY') {
        return {
          success: false,
          error: 'LOW_IMAGE_QUALITY',
          message: err.message || 'Image is too blurry or low quality.',
          hausa_message: err.hausa_message || 'Hoton bai fito da kyau ba. Da fatan a sake daukar wani.'
        };
      }
      throw new Error(err.detail || err.message || 'Disease diagnosis service encountered an issue.');
    }

    return await res.json();
  },

  // Yield Prediction
  async predictYield(data) {
    return await request('/predict/yield', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Weather Proxy
  async fetchWeather(village = 'Bukuru') {
    return await request(`/api/weather?village=${encodeURIComponent(village)}`);
  },

  // Sensors - Fetch latest readings for farmer
  async fetchSensors(farmerId) {
    const query = farmerId ? `?farmer_id=${encodeURIComponent(farmerId)}` : '';
    return await request(`/api/sensors/latest${query}`);
  },

  // Sensors - Record reading from IoT probe or manual entry
  async recordSensorReading(reading) {
    return await request('/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_key: import.meta.env.VITE_IOT_DEVICE_KEY || 'manual_web_entry',
        ...reading
      })
    });
  },

  // Models Metadata
  async fetchModels() {
    return await request('/models');
  },

  // Trigger Retraining
  async triggerRetraining(modelType) {
    return await request(`/admin/retrain?model_type=${modelType}`, { method: 'POST' });
  }
};
