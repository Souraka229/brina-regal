import { supabase } from './supabaseClient'

export const uploadImage = async (file, bucketName) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file)

    if (error) throw error

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    return { success: true, publicUrl }
  } catch (error) {
    console.error('Erreur upload:', error)
    return { success: false, error: error.message }
  }
}

export const deleteImage = async (url, bucketName) => {
  try {
    // Extraire le nom du fichier de l'URL
    const fileName = url.split('/').pop()
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression:', error)
    return { success: false, error: error.message }
  }
}
