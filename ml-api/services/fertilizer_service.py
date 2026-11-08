import csv
import os
from typing import Dict, Any

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "crop_requirements.csv")

RECOMMENDATIONS = {
    "N_low": {
        "title": "Nitrogen Deficient (Low Nitrogen)",
        "summary": "Your soil lacks adequate Nitrogen, causing pale yellow leaves and stunted vegetative growth.",
        "action": "Apply Nitrogen-rich fertilizer such as Urea (46-0-0) or Calcium Ammonium Nitrate (CAN) at 50 kg/acre, or well-decomposed poultry manure.",
        "hausa_action": "Kasa ba ta da isasshen sinadarin Nitrogen. Yi amfani da takin Urea ko CAN, ko kuma takin kaji da ya rube sosai.",
        "priority_nutrient": "Nitrogen (N)"
    },
    "N_high": {
        "title": "Nitrogen Excess (High Nitrogen)",
        "summary": "Too much Nitrogen causes excessive leafy green growth, weak stems, delayed tuber/fruit development, and increased disease susceptibility.",
        "action": "Stop applying Urea or high-N fertilizers immediately. Irrigate thoroughly to leach excess nitrates and apply organic mulch.",
        "hausa_action": "Sinadarin Nitrogen ya yi yawa. Dakatar da zuba takin Urea nan take. Shayar da amfanin gona sosai don rage karfin takin.",
        "priority_nutrient": "Nitrogen (N)"
    },
    "P_low": {
        "title": "Phosphorus Deficient (Low Phosphorus)",
        "summary": "Soil is deficient in Phosphorus, leading to weak root systems, purple/dark leaf discoloration, and poor flowering/tuber set.",
        "action": "Apply Single Superphosphate (SSP) or Di-Ammonium Phosphate (DAP) banded 5cm away from plants, or bone meal compost.",
        "hausa_action": "Sinadarin Phosphorus ya yi kasa. Wannan zai raunana saiwar amfanin gona. Yi amfani da takin SSP ko DAP kusa da tushe.",
        "priority_nutrient": "Phosphorus (P)"
    },
    "P_high": {
        "title": "Phosphorus Excess (High Phosphorus)",
        "summary": "Excessive Phosphorus locks up essential micronutrients like Zinc and Iron in the soil.",
        "action": "Avoid adding DAP or NPK with high middle numbers. Supplement with foliar micronutrient sprays (zinc and iron) if chlorosis appears.",
        "hausa_action": "Sinadarin Phosphorus ya yi yawa a cikin kasa. Guji amfani da takin DAP. Bada ruwa da takin gargajiya ba tare da karin sinadarin P ba.",
        "priority_nutrient": "Phosphorus (P)"
    },
    "K_low": {
        "title": "Potassium Deficient (Low Potassium)",
        "summary": "Low Potassium results in scorched leaf edges, poor disease resistance, and small, poor-quality potatoes or watery tomatoes.",
        "action": "Apply Muriate of Potash (MOP / KCl) or Potassium Sulphate, or work wood ash and well-composted biomass into the topsoil.",
        "hausa_action": "Sinadarin Potassium ya yi kasa. Yana sa gefen ganye ya kone kuma dankali ko tumatur ya zama marar inganci. Yi amfani da takin MOP ko tokar itace.",
        "priority_nutrient": "Potassium (K)"
    },
    "K_high": {
        "title": "Potassium Excess (High Potassium)",
        "summary": "High Potassium interferes with Magnesium and Calcium uptake, which can trigger Blossom End Rot in tomatoes.",
        "action": "Do not add potash fertilizers. Apply Calcium Nitrate or agricultural gypsum to restore the cation balance.",
        "hausa_action": "Sinadarin Potassium ya yi yawa. Wannan zai hana shuka shan sinadarin Calcium. Zuba takin Calcium Nitrate ko gypsum.",
        "priority_nutrient": "Potassium (K)"
    },
    "balanced": {
        "title": "Nutrients Balanced",
        "summary": "Soil NPK levels are within the optimal target range for your crop in Plateau State.",
        "action": "Maintain current soil management. Apply light top-dressing of balanced NPK 15:15:15 or well-cured compost at flowering or tuber initiation.",
        "hausa_action": "Sinadaran kasa (NPK) suna daidai da bukatun amfanin gonarka. Ci gaba da kula da gonar da takin gargajiya mai kyau.",
        "priority_nutrient": "Balanced"
    }
}

def load_crop_requirements() -> Dict[str, Dict[str, float]]:
    requirements = {}
    if not os.path.exists(DATA_PATH):
        # Fallback default values
        return {
            "potato": {"ideal_N": 130.0, "min_N": 100.0, "max_N": 160.0, "ideal_P": 90.0, "min_P": 70.0, "max_P": 110.0, "ideal_K": 170.0, "min_K": 140.0, "max_K": 200.0},
            "tomato": {"ideal_N": 115.0, "min_N": 90.0, "max_N": 140.0, "ideal_P": 70.0, "min_P": 50.0, "max_P": 90.0, "ideal_K": 120.0, "min_K": 90.0, "max_K": 150.0}
        }
    with open(DATA_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            crop_name = row["crop"].strip().lower()
            requirements[crop_name] = {k: float(v) for k, v in row.items() if k != "crop"}
    return requirements

def analyze_fertilizer(crop: str, n: float, p: float, k: float) -> Dict[str, Any]:
    crop_clean = crop.strip().lower()
    if "potato" in crop_clean:
        crop_key = "potato"
    elif "tomato" in crop_clean:
        crop_key = "tomato"
    else:
        crop_key = "potato"

    reqs = load_crop_requirements().get(crop_key)
    if not reqs:
        reqs = {"ideal_N": 130.0, "min_N": 100.0, "max_N": 160.0, "ideal_P": 90.0, "min_P": 70.0, "max_P": 110.0, "ideal_K": 170.0, "min_K": 140.0, "max_K": 200.0}

    # Calculate gap relative to ideal
    gap_n = (n - reqs["ideal_N"]) / reqs["ideal_N"]
    gap_p = (p - reqs["ideal_P"]) / reqs["ideal_P"]
    gap_k = (k - reqs["ideal_K"]) / reqs["ideal_K"]

    gaps = {
        "N": (gap_n, n < reqs["min_N"], n > reqs["max_N"]),
        "P": (gap_p, p < reqs["min_P"], p > reqs["max_P"]),
        "K": (gap_k, k < reqs["min_K"], k > reqs["max_K"]),
    }

    # Find the nutrient with the largest magnitude gap outside min-max bounds
    out_of_bounds = {k: abs(v[0]) for k, v in gaps.items() if v[1] or v[2]}

    if not out_of_bounds:
        status_key = "balanced"
    else:
        largest_nutrient = max(out_of_bounds, key=out_of_bounds.get)
        rel_val, is_low, is_high = gaps[largest_nutrient]
        if is_low:
            status_key = f"{largest_nutrient}_low"
        else:
            status_key = f"{largest_nutrient}_high"

    rec_data = RECOMMENDATIONS.get(status_key, RECOMMENDATIONS["balanced"])

    return {
        "crop": crop_key,
        "status_key": status_key,
        "title": rec_data["title"],
        "summary": rec_data["summary"],
        "action": rec_data["action"],
        "hausa_action": rec_data["hausa_action"],
        "priority_nutrient": rec_data["priority_nutrient"],
        "ideal": {
            "N": reqs["ideal_N"],
            "P": reqs["ideal_P"],
            "K": reqs["ideal_K"],
        },
        "current": {
            "N": n,
            "P": p,
            "K": k,
        },
        "differences": {
            "N": round(n - reqs["ideal_N"], 1),
            "P": round(p - reqs["ideal_P"], 1),
            "K": round(k - reqs["ideal_K"], 1),
        }
    }
