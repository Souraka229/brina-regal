import { uploadToCloudinary } from './cloudinary'

export const uploadImage = async (file, bucketType = 'produits') => {
  try {
    const result = await uploadToCloudinary(file)
    return result
  } catch (error) {
    console.error('Upload service error:', error)
    return {
      success: false,
      error: error.message || 'Erreur de connexion au service d\'upload'
    }
  }
}

// Fonction simplifiée pour la suppression (optionnelle avec Cloudinary)
export const deleteImage = async (publicUrl) => {
  // Avec Cloudinary free, la suppression n'est pas nécessaire
  // Les images sont gérées automatiquement
  return { success: true }
}
