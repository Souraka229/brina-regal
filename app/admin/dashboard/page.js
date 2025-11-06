'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient'
import { uploadImage } from '../../../lib/uploadImage'

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('commandes')
  const [commandes, setCommandes] = useState([])
  const [produits, setProduits] = useState([])
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const router = useRouter()

  // États pour le formulaire NOUVEAU produit
  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: 'Grillades',
    image_url: ''
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const admin = localStorage.getItem('admin')
      if (!admin) {
        router.push('/admin/login')
        return
      }
      setIsAdmin(true)
      await fetchData()
    } catch (error) {
      console.error('Erreur vérification admin:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [commandesData, produitsData, avisData] = await Promise.all([
        supabase.from('commandes').select('*').order('created_at', { ascending: false }),
        supabase.from('produits').select('*').order('nom'),
        supabase.from('avis').select('*').order('created_at', { ascending: false })
      ])

      if (commandesData.data) setCommandes(commandesData.data)
      if (produitsData.data) setProduits(produitsData.data)
      if (avisData.data) setAvis(avisData.data)

    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🖼️ UPLOAD D'IMAGE CORRIGÉ
  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      console.log('📤 Début upload image...', file.name)
      
      const result = await uploadImage(file, 'produits')
      console.log('📤 Résultat upload:', result)
      
      if (result.success) {
        if (isEdit && editingProduct) {
          setEditingProduct({
            ...editingProduct,
            image_url: result.publicUrl
          })
          alert('✅ Image modifiée avec succès!')
        } else {
          setNouveauProduit({
            ...nouveauProduit,
            image_url: result.publicUrl
          })
          alert('✅ Image ajoutée avec succès!')
        }
      } else {
        alert('❌ Erreur upload: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Erreur upload:', error)
      alert('❌ Erreur: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  // ➕ AJOUTER PRODUIT CORRIGÉ
  const ajouterProduit = async (e) => {
    e.preventDefault()
    try {
      console.log('🔄 Ajout produit:', nouveauProduit)
      
      const { data, error } = await supabase
        .from('produits')
        .insert([{
          nom: nouveauProduit.nom,
          description: nouveauProduit.description,
          prix: parseFloat(nouveauProduit.prix),
          categorie: nouveauProduit.categorie,
          image_url: nouveauProduit.image_url,
          disponible: true
        }])
        .select()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw error
      }

      alert('✅ Produit ajouté avec succès!')
      
      // Réinitialiser le formulaire
      setNouveauProduit({
        nom: '',
        description: '',
        prix: '',
        categorie: 'Grillades',
        image_url: ''
      })
      
      // Recharger les données
      await fetchData()
      
    } catch (error) {
      console.error('❌ Erreur ajout produit:', error)
      alert('❌ Erreur lors de l\'ajout: ' + error.message)
    }
  }

  // ✏️ MODIFIER PRODUIT CORRIGÉ
  const modifierProduit = async (e) => {
    e.preventDefault()
    try {
      console.log('🔄 Modification produit:', editingProduct)
      
      const { error } = await supabase
        .from('produits')
        .update({
          nom: editingProduct.nom,
          description: editingProduct.description,
          prix: parseFloat(editingProduct.prix),
          categorie: editingProduct.categorie,
          image_url: editingProduct.image_url
        })
        .eq('id', editingProduct.id)

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw error
      }

      alert('✅ Produit modifié avec succès!')
      setEditingProduct(null)
      await fetchData()
      
    } catch (error) {
      console.error('❌ Erreur modification produit:', error)
      alert('❌ Erreur lors de la modification: ' + error.message)
    }
  }

  // 🗑️ SUPPRIMER PRODUIT CORRIGÉ
  const supprimerProduit = async (produitId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const { error } = await supabase
        .from('produits')
        .update({ disponible: false })
        .eq('id', produitId)

      if (error) throw error

      alert('✅ Produit supprimé!')
      await fetchData()
    } catch (error) {
      console.error('Erreur suppression produit:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  // 🎯 COMMENCER LA MODIFICATION D'UN PRODUIT
  const commencerModification = (produit) => {
    console.log('✏️ Début modification:', produit)
    setEditingProduct({
      ...produit,
      prix: produit.prix.toString() // Convertir en string pour l'input
    })
  }

  // ❌ ANNULER LA MODIFICATION
  const annulerModification = () => {
    setEditingProduct(null)
    setNouveauProduit({
      nom: '',
      description: '',
      prix: '',
      categorie: 'Grillades',
      image_url: ''
    })
  }

  // ... (le reste du code pour commandes et avis reste identique)

  return (
    <div className="min-h-screen bg-dark pt-20 pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-poppins font-bold gradient-text"
          >
            Tableau de Bord Admin
          </motion.h1>
          
          <button
            onClick={() => {
              localStorage.removeItem('admin')
              router.push('/admin/login')
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* Navigation onglets */}
        <div className="flex space-x-4 mb-8 border-b border-gold/20 overflow-x-auto">
          {['commandes', 'produits', 'avis'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-6 font-semibold capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-cream/60 hover:text-cream'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PRODUITS - SECTION CORRIGÉE */}
        {activeTab === 'produits' && (
          <div className="bg-black border border-gold/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gold">Gestion des Produits</h2>
              <span className="text-cream/80">{produits.filter(p => p.disponible).length} produits actifs</span>
            </div>

            {/* Formulaire ajout/modification */}
            <div className="bg-dark p-6 rounded-lg mb-8 border border-gold/20">
              <h3 className="text-xl font-semibold text-gold mb-4">
                {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}
              </h3>
              
              <form onSubmit={editingProduct ? modifierProduit : ajouterProduit}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-cream mb-2">Nom du produit *</label>
                    <input
                      type="text"
                      placeholder="Ex: Poulet Braisé Royal"
                      value={editingProduct ? editingProduct.nom : nouveauProduit.nom}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, nom: e.target.value})
                        : setNouveauProduit({...nouveauProduit, nom: e.target.value})
                      }
                      className="w-full bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-cream mb-2">Prix (XOF) *</label>
                    <input
                      type="number"
                      placeholder="Ex: 5500"
                      value={editingProduct ? editingProduct.prix : nouveauProduit.prix}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, prix: e.target.value})
                        : setNouveauProduit({...nouveauProduit, prix: e.target.value})
                      }
                      className="w-full bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-cream mb-2">Catégorie *</label>
                    <select
                      value={editingProduct ? editingProduct.categorie : nouveauProduit.categorie}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, categorie: e.target.value})
                        : setNouveauProduit({...nouveauProduit, categorie: e.target.value})
                      }
                      className="w-full bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                      required
                    >
                      <option value="Grillades">Grillades</option>
                      <option value="Plats Principaux">Plats Principaux</option>
                      <option value="Plats Traditionnels">Plats Traditionnels</option>
                      <option value="Accompagnements">Accompagnements</option>
                      <option value="Plats Spéciaux">Plats Spéciaux</option>
                      <option value="Plats en Sauce">Plats en Sauce</option>
                      <option value="Plats Végétariens">Plats Végétariens</option>
                      <option value="Salades">Salades</option>
                      <option value="Boissons">Boissons</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  
                  {/* Upload image */}
                  <div>
                    <label className="block text-cream mb-2">Image du produit</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, !!editingProduct)}
                        className="hidden"
                        id="product-image"
                      />
                      <label
                        htmlFor="product-image"
                        className="bg-gold text-dark px-4 py-3 rounded-lg font-semibold hover:bg-orange transition-colors cursor-pointer flex-1 text-center"
                      >
                        {uploadingImage ? '📤 Upload en cours...' : '📸 Choisir une image'}
                      </label>
                    </div>
                    <p className="text-cream/60 text-sm mt-1">JPG, PNG, WebP - max 5MB</p>
                  </div>
                </div>

                {/* Aperçu image */}
                {(editingProduct?.image_url || nouveauProduit.image_url) && (
                  <div className="mb-4 p-4 bg-black/50 rounded-lg border border-gold/20">
                    <p className="text-cream mb-2 font-semibold">🎯 Aperçu de l'image:</p>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={editingProduct ? editingProduct.image_url : nouveauProduit.image_url} 
                        alt="Aperçu du produit" 
                        className="w-32 h-32 object-cover rounded-lg border border-gold/20"
                      />
                      <div>
                        <p className="text-cream/80 text-sm">
                          ✅ Image sélectionnée
                        </p>
                        <p className="text-cream/60 text-xs">
                          Elle sera associée au produit
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-cream mb-2">Description *</label>
                  <textarea
                    placeholder="Décrivez le produit en détail..."
                    value={editingProduct ? editingProduct.description : nouveauProduit.description}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, description: e.target.value})
                      : setNouveauProduit({...nouveauProduit, description: e.target.value})
                    }
                    className="w-full bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-gold to-orange text-dark px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {editingProduct ? '💾 Sauvegarder les modifications' : '➕ Ajouter le produit'}
                  </button>
                  
                  {(editingProduct || nouveauProduit.nom) && (
                    <button
                      type="button"
                      onClick={annulerModification}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      ❌ Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Liste des produits */}
            <div>
              <h3 className="text-xl font-semibold text-gold mb-4">📦 Produits Actifs</h3>
              
              {produits.filter(p => p.disponible).length === 0 ? (
                <div className="text-center py-12 bg-dark/50 rounded-lg border border-gold/20">
                  <p className="text-cream/60 text-xl mb-4">Aucun produit actif</p>
                  <p className="text-cream/40">Commencez par ajouter votre premier produit !</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produits.filter(p => p.disponible).map(produit => (
                    <div key={produit.id} className="border border-gold/20 rounded-lg p-4 bg-dark/30 hover:bg-dark/50 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-gold font-semibold text-lg mb-1">{produit.nom}</h3>
                          <p className="text-cream/80 text-sm mb-2 capitalize">{produit.categorie}</p>
                          <p className="text-cream/70 text-sm mb-2 line-clamp-2">{produit.description}</p>
                          <p className="text-orange font-bold text-xl">{produit.prix} XOF</p>
                        </div>
                        
                        {produit.image_url && (
                          <img 
                            src={produit.image_url} 
                            alt={produit.nom}
                            className="w-16 h-16 object-cover rounded-lg ml-4 border border-gold/20"
                            onError={(e) => {
                              e.target.src = '/images/logo.jpg'
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => commencerModification(produit)}
                          className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex-1 flex items-center justify-center gap-1"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => supprimerProduit(produit.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex-1 flex items-center justify-center gap-1"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... (sections commandes et avis restent identiques) */}
      </div>
    </div>
  )
}
