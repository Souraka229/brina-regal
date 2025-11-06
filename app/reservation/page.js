'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Reservation() {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    nombre_personnes: 2,
    date_reservation: '',
    heure_reservation: '19:00',
    instructions: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Générer les heures d'ouverture
  const heuresDisponibles = []
  for (let i = 13; i <= 23; i++) {
    for (let j = 0; j < 60; j += 30) {
      const heure = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`
      heuresDisponibles.push(heure)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const reservationData = {
        id_client: `reservation_${Date.now()}`,
        type_commande: 'sur_place',
        nom_client: formData.nom,
        telephone: formData.telephone,
        produits: [], // Réservation sans commande spécifique
        total: 0,
        statut: 'réservation',
        heure_reservation: formData.heure_reservation,
        instructions: formData.instructions,
        nombre_personnes: formData.nombre_personnes,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('commandes')
        .insert([reservationData])
        .select()

      if (error) throw error

      alert('✅ Réservation enregistrée ! Nous vous appellerons pour confirmation.')
      router.push('/')
      
    } catch (error) {
      console.error('Erreur réservation:', error)
      setError('Erreur lors de la réservation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Date minimum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                Réserver une table
              </h1>
              <p className="text-cream/60">
                Réservez votre table chez Brina'Régal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-cream mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date_reservation}
                    onChange={(e) => setFormData({...formData, date_reservation: e.target.value})}
                    min={today}
                    className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cream mb-2">Heure *</label>
                  <select
                    value={formData.heure_reservation}
                    onChange={(e) => setFormData({...formData, heure_reservation: e.target.value})}
                    className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                    required
                  >
                    {heuresDisponibles.map(heure => (
                      <option key={heure} value={heure}>{heure}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-cream mb-2">Nombre de personnes *</label>
                <select
                  value={formData.nombre_personnes}
                  onChange={(e) => setFormData({...formData, nombre_personnes: parseInt(e.target.value)})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nombre => (
                    <option key={nombre} value={nombre}>{nombre} personne{nombre > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cream mb-2">Instructions spéciales</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  rows="3"
                  placeholder="Allergies, anniversaire, place spécifique..."
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <h4 className="text-gold font-semibold mb-2">💡 Information importante</h4>
                <p className="text-cream/80 text-sm">
                  Nous vous appellerons au <span className="text-gold font-semibold">{formData.telephone || 'numéro fourni'}</span> 
                  pour confirmer votre réservation dans les plus brefs délais.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-orange text-dark py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Confirmer la réservation'}
              </motion.button>

              <p className="text-center text-cream/60 text-sm">
                Vous pouvez aussi nous appeler directement au{' '}
                <a href="tel:0155557309" className="text-gold hover:text-orange transition-colors font-semibold">
                  01 55 55 73 09
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
