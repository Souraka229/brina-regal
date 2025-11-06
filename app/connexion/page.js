'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Connexion() {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Vérification des identifiants
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', formData.email)
        .eq('mot_de_passe', formData.mot_de_passe)
        .single()

      if (error) throw error

      // Connexion réussie
      localStorage.setItem('client', JSON.stringify(data))
      
      alert('✅ Connexion réussie !')
      router.push('/compte')
      
    } catch (error) {
      console.error('Erreur connexion:', error)
      setError('Email ou mot de passe incorrect')
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
                Se connecter
              </h1>
              <p className="text-cream/60">
                Accédez à votre compte Brina'Régal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-cream mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-cream mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
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
                {loading ? 'Connexion...' : 'Se connecter'}
              </motion.button>

              <p className="text-center text-cream/60">
                Pas de compte ?{' '}
                <Link href="/inscription" className="text-gold hover:text-orange transition-colors">
                  S'inscrire
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
