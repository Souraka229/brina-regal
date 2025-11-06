import { uploadToCloudinary } from './cloudinary'

export const uploadImage = async (file, bucketType = 'produits') => {
  try {
    // Déterminer le dossier Cloudinary
    const folder = bucketType === 'paiements' ? 'brina-regal/paiements' : 'brina-regal/produits'
    
    const result = await uploadToCloudinary(file, folder)
    return result
  } catch (error) {
    console.error('Upload service error:', error)
    return {
      success: false,
      error: error.message || 'Erreur de connexion au service d\'upload'
    }
  }
}

export const deleteImage = async (publicUrl) => {
  return { success: true }
}
