'use client'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Panier() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()
  const [lieu, setLieu] = useState('')
  const [telephone, setTelephone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulation de commande
      console.log('Commande:', {
        items,
        total: getTotalPrice(),
        telephone,
        lieu
      })

      // Ici vous intégrerez Supabase plus tard
      alert('Commande passée avec succès! Nous vous contacterons bientôt.')
      
      clearCart()
      router.push('/')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la commande')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-poppins font-bold mb-8 gradient-text"
          >
            Votre Panier
          </motion.h1>
          <p className="text-cream/80 text-xl mb-6">Votre panier est vide</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/menu')}
            className="bg-gradient-to-r from-gold to-orange text-dark px-8 py-3 rounded-full font-semibold"
          >
            Voir le Menu
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-poppins font-bold mb-8 gradient-text text-center"
        >
          Finaliser la Commande
        </motion.h1>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Récapitulatif commande */}
          <div className="bg-black border border-gold/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gold mb-6">Votre Commande</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center py-4 border-b border-gold/10"
                >
                  <div className="flex-1">
                    <h3 className="text-gold font-semibold">{item.nom}</h3>
                    <p className="text-cream/70">{item.prix} XOF x {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gold text-dark rounded-full flex items-center justify-center hover:bg-orange transition-colors"
                      >
                        -
                      </button>
                      <span className="text-cream w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gold text-dark rounded-full flex items-center justify-center hover:bg-orange transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gold/20">
              <div className="flex justify-between text-xl font-bold text-gold">
                <span>Total:</span>
                <span>{getTotalPrice()} XOF</span>
              </div>
            </div>
          </div>

          {/* Formulaire de commande */}
          <form onSubmit={handleSubmit} className="bg-black border border-gold/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gold mb-6">Informations</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-cream mb-2">Lieu de livraison</label>
                <select
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                >
                  <option value="">Choisissez...</option>
                  <option value="restaurant">Sur place au restaurant</option>
                  <option value="dekounge">Dekoungbé et environs</option>
                  <option value="abomey">Autres zones d'Abomey-Calavi</option>
                </select>
              </div>

              <div>
                <label className="block text-cream mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gold to-orange text-dark py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer la Commande'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
