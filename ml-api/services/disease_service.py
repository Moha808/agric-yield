import io
from typing import Dict, Any, Tuple
from PIL import Image
import numpy as np

CLASS_NAMES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

DISEASE_INFO: Dict[str, Dict[str, Any]] = {
    "Potato___Early_blight": {
        "common_name": "Potato Early Blight (Alternaria solani)",
        "hausa_name": "Ciwon Kunar Ganyen Dankali na Farko",
        "crop": "Potato",
        "severity": "Moderate",
        "symptoms": "Dark brown circular spots with concentric rings (target-board appearance) primarily on older, lower foliage.",
        "organic_treatment": "Remove and burn or bury infected bottom leaves immediately. Spray organic copper fungicide or neem oil solution every 7 days.",
        "chemical_treatment": "Apply Mancozeb 80% WP (2.5 g/L) or Chlorothalonil 75% WP. In Plateau conditions, spray proactively at the first sign of lesions.",
        "prevention": "Rotate crops with non-solanaceous crops (maize, beans) for at least 2 seasons. Ensure wide row spacing for good air circulation in Jos South highlands.",
        "hausa_action": "Cire ganyen da ya kamu ka kona shi ko ka binne. Fesa maganin tagulla (copper) ko ruwan itacen dogon yaro (neem) duk bayan kwanaki 7."
    },
    "Potato___Late_blight": {
        "common_name": "Potato Late Blight (Phytophthora infestans)",
        "hausa_name": "Ciwon Kunar Ganyen Dankali Mai Tsanani (Late Blight)",
        "crop": "Potato",
        "severity": "Severe",
        "symptoms": "Rapidly spreading water-soaked, dark purplish-brown lesions with white fuzzy mold growth on leaf undersides during cool, moist Jos weather.",
        "organic_treatment": "Remove severely infected hills immediately. Spray Copper oxychloride or Bordeaux mixture early morning. Avoid overhead watering.",
        "chemical_treatment": "Urgent application of systemic fungicide: Metalaxyl-M + Mancozeb (e.g. Ridomil Gold 68 WG at 2.5kg/ha) alternated with Dimethomorph to prevent resistance.",
        "prevention": "Plant certified disease-free seed tubers from National Root Crops Research Institute (NRCRI Vom). Hill potatoes well to protect tubers from spores.",
        "hausa_action": "Wannan ciwo ne mai hadari sosai a lokacin sanyin Jos! Yi amfani da maganin Ridomil Gold ko Mancozeb nan take don ceto amfanin gonar."
    },
    "Potato___healthy": {
        "common_name": "Healthy Potato Leaf",
        "hausa_name": "Lafiyayyen Ganyen Dankali",
        "crop": "Potato",
        "severity": "None",
        "symptoms": "Vibrant green leaves with no visible lesions, mold, chlorosis, or necrotic spots.",
        "organic_treatment": "No treatment required. Continue standard mulching and balanced fertilization.",
        "chemical_treatment": "No chemical application needed. Avoid unnecessary preventative pesticide sprays to preserve beneficial insects.",
        "prevention": "Maintain consistent moisture and balanced potassium nutrition for sturdy tuber bulking.",
        "hausa_action": "Ganyen dankalin yana da cikakkiyar lafiya. Ci gaba da ba shi ruwa da taki a kan kari."
    },
    "Tomato___Bacterial_spot": {
        "common_name": "Tomato Bacterial Spot (Xanthomonas spp.)",
        "hausa_name": "Dodon Kwayoyin Cuta na Tumatur",
        "crop": "Tomato",
        "severity": "Moderate",
        "symptoms": "Small, dark, greasy or water-soaked lesions that turn brown with a yellow halo; leaves turn ragged.",
        "organic_treatment": "Apply fixed copper hydroxide sprays mixed with Bacillus subtilis bio-fungicide. Avoid working in the field while plants are wet.",
        "chemical_treatment": "Copper hydroxide combined with Mancozeb spray provides synergistic suppression of bacterial strains.",
        "prevention": "Use certified hot-water treated seeds or resistant nursery varieties. Disinfect wooden stakes and pruning shears.",
        "hausa_action": "Kada ka taba shukar idan tana da danshi don hana yaduwar kwayoyin cutar. Fesa maganin tagulla (copper) a lokacin sanyi."
    },
    "Tomato___Early_blight": {
        "common_name": "Tomato Early Blight (Alternaria linariae)",
        "hausa_name": "Kunar Ganyen Tumatur na Farko",
        "crop": "Tomato",
        "severity": "Moderate",
        "symptoms": "Concentric dark brown rings surrounded by chlorotic yellow halos starting on lowest leaves.",
        "organic_treatment": "Prune lowest branches 20cm above the soil line to prevent soil-splash transmission. Spray neem oil or compost tea.",
        "chemical_treatment": "Spray Mancozeb, Chlorothalonil, or Azoxystrobin every 7 to 10 days during rainy weather.",
        "prevention": "Mulch soil with dry grass or straw to prevent rain splash. Practice 3-year crop rotation.",
        "hausa_action": "Datsa ganyen kasa domin ruwan sama kada ya watsa kwayar cutar daga kasa zuwa shuka. Fesa Mancozeb ko man dogon yaro."
    },
    "Tomato___Late_blight": {
        "common_name": "Tomato Late Blight (Phytophthora infestans)",
        "hausa_name": "Kunar Ganyen Tumatur Mai Tsanani",
        "crop": "Tomato",
        "severity": "Severe",
        "symptoms": "Greasy olive-green to black blotches on leaves and stems; white mildew underneath under humid conditions; greasy brown rot on green tomatoes.",
        "organic_treatment": "Prune and destroy infected plants immediately. Spray preventive copper bactericide/fungicide.",
        "chemical_treatment": "Apply Metalaxyl + Mancozeb (Ridomil Gold) or Cymoxanil immediately. Repeat in 5-7 days if rainfall continues.",
        "prevention": "Ensure good spacing and trellising for rapid leaf drying. Do not plant potatoes and tomatoes adjacent to each other in Jos South.",
        "hausa_action": "Ciwon yana yaduwa da sauri cikin sanyi da ruwan sama. Fesa maganin Ridomil Gold nan take kuma ka cire ganyen da ya rube."
    },
    "Tomato___Leaf_Mold": {
        "common_name": "Tomato Leaf Mold (Passalora fulva)",
        "hausa_name": "Farin Kuma na Ganyen Tumatur",
        "crop": "Tomato",
        "severity": "Mild to Moderate",
        "symptoms": "Pale green to yellow spots on upper leaf surface, with velvety olive-green to brown mold on lower leaf surface.",
        "organic_treatment": "Improve air circulation through pruning and greenhouse/shade-net ventilation. Spray baking soda solution (5g/L with soap) or sulfur.",
        "chemical_treatment": "Spray Chlorothalonil, Difenoconazole, or Copper oxychloride at first symptom.",
        "prevention": "Lower relative humidity around foliage below 85% by spacing rows and drip irrigating at the root zone.",
        "hausa_action": "Bada iska sosai tsakanin shuke-shuke ta hanyar rage rassan da suka yi cunkoso. Fesa maganin sulfur ko baking soda."
    },
    "Tomato___Septoria_leaf_spot": {
        "common_name": "Tomato Septoria Leaf Spot (Septoria lycopersici)",
        "hausa_name": "Tabon Septoria na Ganyen Tumatur",
        "crop": "Tomato",
        "severity": "Moderate",
        "symptoms": "Numerous small, circular spots with dark brown margins and sunken grayish-white centers dotted with tiny black fruiting bodies.",
        "organic_treatment": "Remove lower infected foliage. Apply bio-fungicide containing Bacillus amyloliquefaciens or sulfur spray.",
        "chemical_treatment": "Apply Chlorothalonil or Mancozeb every 7-10 days throughout the vegetative and fruiting periods.",
        "prevention": "Control solanaceous weeds (e.g. black nightshade) around farm perimeters. Mulch soil heavily.",
        "hausa_action": "Cire tsofaffin ganyen kasa masu tabo. Fesa Mancozeb ko Chlorothalonil duk bayan kwana 10."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "common_name": "Two-Spotted Spider Mites (Tetranychus urticae)",
        "hausa_name": "Kananan Kayan Gizo-gizo na Tumatur",
        "crop": "Tomato",
        "severity": "Moderate",
        "symptoms": "Fine yellow stippling or bronzing on leaves; delicate silky webbing under leaves and at stem junctions; leaves dry up and drop.",
        "organic_treatment": "Spray leaves forcefully with water to dislodge mites, then apply Neem oil extract or insecticidal potassium soap under leaf surfaces.",
        "chemical_treatment": "Apply Abamectin 1.8% EC (0.5 ml/L) or Spiromesifen. Avoid broad-spectrum pyrethroids which kill natural predatory mites.",
        "prevention": "Avoid water stress, as dusty, hot conditions accelerate spider mite reproduction in dry season farming.",
        "hausa_action": "Fesa man itacen dogon yaro (neem oil) ko sabulun magani a karkashin ganye. Ka tabbatar gonar ba ta bushe sosai ba."
    },
    "Tomato___Target_Spot": {
        "common_name": "Tomato Target Spot (Corynespora cassiicola)",
        "hausa_name": "Tabon Target na Tumatur",
        "crop": "Tomato",
        "severity": "Moderate",
        "symptoms": "Brown circular lesions with concentric rings; lesions expand and can cause severe premature defoliation.",
        "organic_treatment": "Sanitize field debris. Spray copper-based fungicides weekly during high humidity.",
        "chemical_treatment": "Apply Azoxystrobin + Difenoconazole or Boscalid formulations.",
        "prevention": "Trellis plants off the ground to facilitate rapid foliage drying. Keep foliage clear of standing splash water.",
        "hausa_action": "Daga shukar sama da itace (trellising) don rage danshi. Fesa maganin tagulla (copper fungicide)."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "common_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "hausa_name": "Ciwon Kwayar Cutar Rawaya da Lankwasa Ganye (TYLCV)",
        "crop": "Tomato",
        "severity": "Severe",
        "symptoms": "Severe upward leaf cupping, reduced leaf size, bright interveinal yellowing, stunted erect bushy growth, failure to set fruit.",
        "organic_treatment": "Virus cannot be cured once plant is infected. Rogue and destroy infected plants immediately. Control whitefly vectors using yellow sticky traps and neem oil.",
        "chemical_treatment": "Control the insect vector (Bemisia tabaci whitefly): spray Acetamiprid, Imidacloprid, or Thiamethoxam early in the morning.",
        "prevention": "Grow TYLCV-resistant varieties. Use 50-mesh insect netting in nurseries to prevent early whitefly feeding.",
        "hausa_action": "Wannan cuta ce mai saurin shanye shuka da kuda fari ke yadawa. Cire shukar da ta kamu ka kona ta, sannan ka fesa maganin kashe kudin fari."
    },
    "Tomato___Tomato_mosaic_virus": {
        "common_name": "Tomato Mosaic Virus (ToMV)",
        "hausa_name": "Ciwon Mosaic na Tumatur",
        "crop": "Tomato",
        "severity": "Severe",
        "symptoms": "Mottled light and dark green patterns on leaves, leaf distortion, 'shoestring' or fern-like appearance, uneven fruit ripening.",
        "organic_treatment": "Remove and incinerate infected plants immediately. Wash hands in skimmed milk or trisodium phosphate before handling healthy plants.",
        "chemical_treatment": "No chemical virucides exist. Focus on complete sanitary eradication and insect/human vector management.",
        "prevention": "Disinfect all tools with 10% bleach. Avoid smoking or tobacco handling near tomato crops as tobacco carries mosaic virus.",
        "hausa_action": "Babu maganin da ke warkar da wannan cutar. Cire duk shukar da ta kamu. Wanke hannu da kayan aiki da ruwan omo kafin taba sauran shuke-shuke."
    },
    "Tomato___healthy": {
        "common_name": "Healthy Tomato Leaf",
        "hausa_name": "Lafiyayyen Ganyen Tumatur",
        "crop": "Tomato",
        "severity": "None",
        "symptoms": "Uniform rich green leaves, sturdy foliage structure, no spotting or discoloration.",
        "organic_treatment": "No treatment required. Continue standard irrigation and organic mulching.",
        "chemical_treatment": "No chemical application necessary.",
        "prevention": "Ensure calcium availability (e.g. gypsum) to prevent Blossom End Rot during fruit formation in Plateau soils.",
        "hausa_action": "Ganyen tumaturin yana cikin cikakkiyar koshin lafiya. Ci gaba da kula da shi yadda ya kamata."
    }
}

def preprocess_image(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0) # Shape: (1, 224, 224, 3)
    return arr

def assess_image_quality(image_bytes: bytes) -> Tuple[bool, str]:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("L")
        width, height = image.size
        if width < 80 or height < 80:
            return False, "Image resolution is too low. Please take a clearer, closer photo of the leaf."
        
        # Laplacian variance check for blurriness
        img_np = np.array(image, dtype=np.float32)
        # 3x3 Laplacian kernel
        laplacian = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]])
        # Simple convolution using numpy slicing
        sub = (
            img_np[0:-2, 1:-1] +
            img_np[2:, 1:-1] +
            img_np[1:-1, 0:-2] +
            img_np[1:-1, 2:] -
            4 * img_np[1:-1, 1:-1]
        )
        variance = float(np.var(sub))
        if variance < 30.0:
            return False, "Photo appears blurry or out of focus. Please retake a steady photo under good daylight."
        return True, "Good quality"
    except Exception as e:
        return False, f"Could not process image file: {str(e)}"
