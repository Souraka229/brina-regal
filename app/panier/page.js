'use client'
import { useState, useEffect } from 'react'
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
  const [uploadError, setUploadError] = useState('')
  const [client, setClient] = useState(null)
  const router = useRouter()

  // Charger les informations du client depuis le localStorage
  useEffect(() => {
    const clientData = localStorage.getItem('client')
    if (clientData) {
      setClient(JSON.parse(clientData))
    }
  }, [])

  // --------------------- Fonction d'upload ---------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('❌ Image trop volumineuse (maximum 5MB)')
      setUploading(false)
      return
    }

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('❌ Format non supporté (JPEG, PNG, WebP seulement)')
      setUploading(false)
      return
    }

    try {
      // Appeler la fonction uploadImage avec le dossier 'paiements'
      const result = await uploadImage(file, 'paiements')

      if (result.success && result.publicUrl) {
        setImagePreuve(result.publicUrl)
        setUploadError('')
        console.log('✅ Image uploadée:', result.publicUrl)
      } else {
        setUploadError(result.error || '❌ Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadError('❌ Erreur inattendue: ' + (error.message || error))
    } finally {
      setUploading(false)
    }
  }

  // --------------------- Soumission de commande ---------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError('')

    try {
      // Validation des champs
      if (lieu === 'hors_zone' && !imagePreuve) {
        setUploadError('Veuillez téléverser une preuve de paiement')
        setIsSubmitting(false)
        return
      }

      if (!telephone || telephone.length < 8) {
        setUploadError('Numéro de téléphone invalide')
        setIsSubmitting(false)
        return
      }

      // Préparer les données de commande
      const commandeData = {
        id_client: client ? `client_${client.id}` : `guest_${Date.now()}`,
        client_id: client ? client.id : null,
        produits: items,
        total: getTotalPrice(),
        telephone: telephone.trim(),
        lieu_livraison: lieu,
        image_preuve: imagePreuve,
        statut: 'en attente',
        created_at: new Date().toISOString()
      }

      console.log('Envoi de la commande:', commandeData)

      // Insérer la commande dans Supabase
      const { data, error } = await supabase
        .from('commandes')
        .insert([commandeData])
        .select()

      if (error) {
        console.error('Erreur Supabase:', error)
        throw new Error(`Erreur base de données: ${error.message}`)
      }

      console.log('Commande créée avec succès:', data)

      // Notification de succès
      alert('✅ Commande passée avec succès ! Nous vous contacterons pour confirmation.')

      // Vider le panier et rediriger vers la page d’accueil
      clearCart()
      router.push('/')

    } catch (error) {
      console.error('Erreur complète:', error)
      setUploadError('Erreur lors de la commande: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --------------------- Affichage panier vide ---------------------
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

  // --------------------- Affichage panier avec formulaire ---------------------
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
          {/* ----------------- Récapitulatif commande ----------------- */}
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

          {/* ----------------- Formulaire de commande ----------------- */}
          <form onSubmit={handleSubmit} className="bg-black border border-gold/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gold mb-6">Informations de Livraison</h2>
            
            {/* Message d'erreur global */}
            {uploadError && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400 flex items-center gap-2">
                  ⚠️ {uploadError}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-cream mb-2">Lieu de livraison *</label>
                <select
                  value={lieu}
                  onChange={(e) => {
                    setLieu(e.target.value)
                    setUploadError('')
                  }}
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
                  onChange={(e) => {
                    setTelephone(e.target.value)
                    setUploadError('')
                  }}
                  className="w-full bg-dark border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                  placeholder="0123456789"
                  pattern="[0-9]{8,15}"
                  required
                />
                <p className="text-cream/60 text-sm mt-1">Format: 0123456789 (sans espaces)</p>
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
                        <p className="text-green-400 flex items-center gap-2">
                          ✅ Image téléversée avec succès
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <img 
                          src={imagePreuve} 
                          alt="Preuve de paiement" 
                          className="w-20 h-20 object-cover rounded-lg border border-gold/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreuve(null)
                            setUploadError('')
                          }}
                          className="text-red-500 hover:text-red-400 text-sm bg-red-500/10 px-3 py-1 rounded"
                        >
                          Changer l'image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gold/30 rounded-lg p-6 text-center hover:border-gold/50 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg, image/jpg, image/png, image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="preuve-paiement"
                        required={lieu === 'hors_zone'}
                      />
                      <label
                        htmlFor="preuve-paiement"
                        className="cursor-pointer block"
                      >
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-cream mb-2 font-semibold">Cliquez pour téléverser</p>
                        <p className="text-cream/60 text-sm">
                          Formats: JPG, PNG, WebP (max 5MB)
                        </p>
                      </label>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold mx-auto mb-2"></div>
                      <p className="text-cream/60 text-sm">Upload en cours...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions de paiement */}
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <h4 className="text-gold font-semibold mb-2">💡 Instructions de Paiement</h4>
                {lieu === 'hors_zone' ? (
                  <div className="text-cream/80 text-sm space-y-1">
                    <p>1. Effectuez le transfert au: <span className="text-gold font-semibold">01 55 55 73 09</span></p>
                    <p>2. Capturez l'écran de confirmation</p>
                    <p>3. Téléversez la capture ci-dessus</p>
                    <p className="text-orange font-semibold mt-2">⚠️ Commande traitée après vérification</p>
                  </div>
                ) : (
                  <p className="text-cream/80 text-sm">
                    💰 <span className="text-gold font-semibold">Paiement à la livraison</span> - Présentez-vous avec le montant exact
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || uploading || (lieu === 'hors_zone' && !imagePreuve)}
                className="w-full bg-gradient-to-r from-gold to-orange text-dark py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                    Traitement en cours...
                  </span>
                ) : uploading ? (
                  'Upload en cours...'
                ) : (
                  `Confirmer la Commande - ${getTotalPrice()} XOF`
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
