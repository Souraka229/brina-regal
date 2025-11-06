export const uploadToCloudinary = async (file) => {
  try {
    if (!file) {
      throw new Error('Aucun fichier sélectionné')
    }

    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Le fichier est trop volumineux (max 5MB)')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Erreur lors de l\'upload')
    }

    const data = await response.json()
    
    return {
      success: true,
      publicUrl: data.secure_url,
      publicId: data.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
