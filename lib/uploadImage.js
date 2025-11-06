import { supabase } from './supabaseClient'

export const uploadImage = async (file, bucketName) => {
  try {
    // Vérifier que le fichier existe
    if (!file) {
      throw new Error('Aucun fichier sélectionné')
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Le fichier est trop volumineux (max 5MB)')
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = fileName

    console.log('Upload attempt:', { bucketName, fileName, fileSize: file.size })

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Erreur upload: ${error.message}`)
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    console.log('Upload success, public URL:', publicUrl)

    return { 
      success: true, 
      publicUrl,
      filePath 
    }
  } catch (error) {
    console.error('Upload function error:', error)
    return { 
      success: false, 
      error: error.message || 'Erreur inconnue lors de l\'upload'
    }
  }
}

export const deleteImage = async (filePath, bucketName) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression:', error)
    return { success: false, error: error.message }
  }
}
