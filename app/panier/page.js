'use client'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { uploadImage } from '../../lib/uploadImage'
import { useRouter } from 'next/navigation'

export default function Panier() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()
  const [lieu, setLieu] = useState('')
  const [telephone, setTelephone] = useState('')
  const [imagePreuve, setImagePreuve] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineuse (max 5MB)')
      return
    }

    setUploading(true)
    const result = await uploadImage(file, 'paiements')
    setUploading(false)

    if (result.success) {
      setImagePreuve(result.publicUrl)
    } else {
      alert('Erreur lors de l\'upload de l\'image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Vérification pour les commandes hors zone
      if (lieu === 'hors_zone' && !imagePreuve) {
        alert('Veuillez téléverser une preuve de paiement pour les commandes hors zone')
        setIsSubmitting(false)
        return
      }

      const commandeData = {
        id_client: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        produits: items,
        total: getTotalPrice(),
        telephone,
        lieu_livraison: lieu,
        image_preuve: imagePreuve,
        statut: 'en attente',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('commandes')
        .insert([commandeData])

      if (error) throw error

      // Envoyer une notification (vous pouvez ajouter un webhook ou email plus tard)
      await sendNotification(commandeData)

      clearCart()
      alert('Commande passée avec succès! Nous vous contacterons pour confirmation.')
      router.push('/')
    } catch (error) {
      console.error('Erreur commande:', error)
      alert('Erreur lors de la commande: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendNotification = async (commande) => {
    // Ici vous pouvez intégrer avec un service de notifications
    // Pour l'instant, on log juste dans la console
    console.log('Nouvelle commande:', commande)
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
            <h2 className="text-2xl font-semibold text-gold mb-6">Informations de Livraison</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-cream mb-2">Lieu de livraison *</label>
                <select
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  required
                >
                  <option value="">Choisissez votre lieu...</option>
                  <option value="restaurant">Sur place au restaurant</option>
                  <option value="dekounge">Dekoungbé et environs immédiats</option>
                  <option value="abomey">Autres zones d'Abomey-Calavi</option>
                  <option value="hors_zone">Hors zone (dépôt requis)</option>
                </select>
              </div>

              <div>
                <label className="block text-cream mb-2">Numéro de téléphone *</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>

              {lieu === 'hors_zone' && (
                <div>
                  <label className="block text-cream mb-2">
                    Preuve de dépôt *
                    <span className="text-red-400 ml-1">(Capture du transfert mobile)</span>
                  </label>
                  
                  {imagePreuve ? (
                    <div className="mb-4">
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-2">
                        <p className="text-green-400">✅ Image téléversée avec succès</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImagePreuve(null)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Changer l'image
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gold/30 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="preuve-paiement"
                        required
                      />
                      <label
                        htmlFor="preuve-paiement"
                        className="cursor-pointer block"
                      >
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-cream mb-2">Cliquez pour téléverser</p>
                        <p className="text-cream/60 text-sm">
                          Format: JPG, PNG (max 5MB)
                        </p>
                      </label>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto"></div>
                      <p className="text-cream/60 mt-2">Upload en cours...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <h4 className="text-gold font-semibold mb-2">💡 Information importante</h4>
                <p className="text-cream/80 text-sm">
                  {lieu === 'hors_zone' 
                    ? 'Votre commande sera traitée après vérification de la preuve de dépôt.'
                    : 'Paiement à la livraison. Présentez-vous avec le montant exact.'
                  }
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || (lieu === 'hors_zone' && !imagePreuve)}
                className="w-full bg-gradient-to-r from-gold to-orange text-dark py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Confirmer la Commande'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
