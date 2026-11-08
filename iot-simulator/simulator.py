#!/usr/bin/env python3
"""
AgriYield AI - IoT Sensor Node Simulator
Simulates a Raspberry Pi / ESP32 agricultural sensor node deployed in a potato/tomato
field in Jos South (Plateau State, Nigeria).

Transmits telemetry to the AgriYield ML API:
- Volumetric Soil Moisture (%)
- Soil Temperature (°C)
- Ambient Air Temperature (°C)
- Relative Humidity (%)

Hardware Reference (Field Deployment):
- Microcontroller: Raspberry Pi 4B or ESP32-WROOM
- Soil Moisture: Capacitive Soil Moisture Sensor v1.2 (via MCP3008 ADC)
- Soil Temperature: DS18B20 waterproof probe
- Air Temp/Humidity: DHT22 / AM2302
- Power: 10W Solar Panel + 3.7V 18650 Li-ion battery shield
- Connectivity: 2G/4G SIM7600 GSM modem or Wi-Fi (Bukuru / Vom coverage)
"""

import time
import random
import argparse
import sys
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    print("Error: 'requests' library required. Run: pip install requests")
    sys.exit(1)

def run_simulator(
    api_url: str,
    device_key: str,
    farmer_id: str,
    interval_sec: int,
    village: str,
    drift_mode: bool
):
    print("=" * 60)
    print("  AgriYield AI - Smallholder IoT Sensor Node Simulator")
    print(f"  Target Endpoint : {api_url}")
    print(f"  Device ID       : {farmer_id} [Village: {village}]")
    print(f"  Interval        : {interval_sec} seconds")
    print("=" * 60)

    # Initial realistic values for Jos South highlands
    soil_moisture = 55.0  # Percentage
    soil_temp = 20.5      # Celsius
    air_temp = 23.0       # Celsius
    humidity = 62.0       # Percentage

    reading_idx = 1
    while True:
        # Realistic diurnal fluctuations & random sensor jitter
        if drift_mode:
            # Simulate afternoon drying out
            soil_moisture = max(25.0, min(85.0, soil_moisture + random.uniform(-0.8, 0.4)))
            soil_temp = max(16.0, min(26.0, soil_temp + random.uniform(-0.2, 0.3)))
            air_temp = max(17.0, min(29.0, air_temp + random.uniform(-0.3, 0.5)))
            humidity = max(35.0, min(88.0, humidity + random.uniform(-0.6, 0.6)))
        else:
            soil_moisture = round(52.0 + random.uniform(-3.0, 3.0), 1)
            soil_temp = round(21.0 + random.uniform(-1.0, 1.0), 1)
            air_temp = round(23.5 + random.uniform(-1.5, 1.5), 1)
            humidity = round(60.0 + random.uniform(-4.0, 4.0), 1)

        payload = {
            "device_key": device_key,
            "farmer_id": farmer_id,
            "soil_moisture": round(soil_moisture, 1),
            "soil_temp": round(soil_temp, 1),
            "air_temp": round(air_temp, 1),
            "humidity": round(humidity, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Transmitting Packet #{reading_idx}:")
        print(f"  > Soil Moisture : {payload['soil_moisture']}%")
        print(f"  > Soil Temp     : {payload['soil_temp']} °C")
        print(f"  > Air Temp      : {payload['air_temp']} °C")
        print(f"  > Humidity      : {payload['humidity']}%")

        try:
            resp = requests.post(api_url, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                print(f"  [OK] Ingested successfully (HTTP 200)")
                if "advice" in data:
                    print(f"  [ADVICE] {data['advice']}")
            else:
                print(f"  [FAIL] HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"  [ERROR] Connection failed: {e}")

        reading_idx += 1
        time.sleep(interval_sec)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriYield AI IoT Simulator")
    parser.add_argument("--url", default="http://localhost:8000/api/sensors", help="Sensor ingestion endpoint")
    parser.add_argument("--key", default="test_device_key", help="Device authentication key")
    parser.add_argument("--farmer", default="farmer_vom_01", help="Farmer ID / Device serial")
    parser.add_argument("--village", default="Vom", help="Village in Jos South")
    parser.add_argument("--interval", type=int, default=10, help="Transmission interval (seconds)")
    parser.add_argument("--drift", action="store_true", help="Enable dynamic climate drift")

    args = parser.parse_args()
    try:
        run_simulator(
            api_url=args.url,
            device_key=args.key,
            farmer_id=args.farmer,
            interval_sec=args.interval,
            village=args.village,
            drift_mode=args.drift
        )
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")
