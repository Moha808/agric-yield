/**
 * Cloudinary Direct Upload Service for AgriYield AI
 * Uploads farmer leaf photos to Cloudinary using an unsigned upload preset.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary cloud name is not set. Using local image preview.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return data.secure_url || null;
    }

    // If initial upload fails (e.g. preset named agriyield_leaf_uploads instead), attempt graceful fallback
    const errData = await res.json().catch(() => ({}));
    console.warn('Initial Cloudinary preset error:', errData);

    const fallbackPresets = ['agriyield_leaf_uploads', 'ml_default'];
    for (const preset of fallbackPresets) {
      if (preset === CLOUDINARY_UPLOAD_PRESET) continue;
      try {
        const retryForm = new FormData();
        retryForm.append('file', file);
        retryForm.append('upload_preset', preset);
        const retryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: retryForm
        });
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          return retryData.secure_url || null;
        }
      } catch {}
    }

    return null;
  } catch (error) {
    console.warn('Could not upload image to Cloudinary (possibly offline):', error);
    return null;
  }
}
