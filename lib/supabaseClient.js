// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Vérification stricte pour éviter les erreurs de configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables are missing. Using default development values.'
  )
}

// Valeurs par défaut pour le développement local
const url = supabaseUrl || 'https://default-url.supabase.co'
const key = supabaseAnonKey || 'default-anon-key'

// Création du client Supabase
export const supabase = createClient(url, key)

/**
 * Fonction de test de connexion à Supabase
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('produits').select('*').limit(1)
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message || String(error) }
  }
}
