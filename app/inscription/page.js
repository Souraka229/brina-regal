'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Inscription() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    adresse: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      // Inscription dans Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          mot_de_passe: formData.mot_de_passe, // En production, hash le mot de passe
          adresse: formData.adresse
        }])
        .select()
        .single()

      if (error) throw error

      // Connexion automatique
      localStorage.setItem('client', JSON.stringify(data))
      
      alert('✅ Inscription réussie ! Bienvenue chez Brina\'Régal')
      router.push('/compte')
      
    } catch (error) {
      console.error('Erreur inscription:', error)
      setError(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black border border-gold/20 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-dark font-bold text-lg">BR</span>
                </div>
              </Link>
              <h1 className="text-3xl font-poppins font-bold gradient-text mb-2">
                Créer un compte
              </h1>
              <p className="text-cream/60">
                Rejoignez Brina'Régal et suivez vos commandes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-cream mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Adresse</label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  rows="3"
                  placeholder="Votre adresse de livraison..."
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Mot de passe *</label>
                <input
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={formData.confirmer_mot_de_passe}
                  onChange={(e) => setFormData({...formData, confirmer_mot_de_passe: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-orange text-dark py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Inscription en cours...' : 'Créer mon compte'}
              </motion.button>

              <p className="text-center text-cream/60">
                Déjà un compte ?{' '}
                <Link href="/connexion" className="text-gold hover:text-orange transition-colors">
                  Se connecter
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
