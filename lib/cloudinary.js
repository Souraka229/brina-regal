export const uploadToCloudinary = async (file, folder = 'brina-regal') => {
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
    formData.append('upload_preset', 'brina-regal') // ✅ Votre preset réel
    formData.append('folder', folder)
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

    console.log('🌐 Envoi à Cloudinary...', {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: 'brina-regal',
      folder: folder,
      fileSize: file.size,
      fileName: file.name
    })

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erreur Cloudinary:', errorData)
      throw new Error(errorData.error?.message || 'Erreur lors de l\'upload')
    }

    const data = await response.json()
    console.log('✅ Upload réussi:', data.secure_url)
    
    return {
      success: true,
      publicUrl: data.secure_url,
      publicId: data.public_id
    }
  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
