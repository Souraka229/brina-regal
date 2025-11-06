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
  const [filtreStatut, setFiltreStatut] = useState('tous') // Nouveau filtre
  const router = useRouter()

  // États pour le formulaire
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

  // 🔄 FILTRER LES COMMANDES PAR STATUT
  const commandesFiltrees = filtreStatut === 'tous' 
    ? commandes 
    : commandes.filter(cmd => cmd.statut === filtreStatut)

  // 📊 STATISTIQUES PAR CATÉGORIE
  const statsCommandes = {
    tous: commandes.length,
    'en attente': commandes.filter(c => c.statut === 'en attente').length,
    'confirmé': commandes.filter(c => c.statut === 'confirmé').length,
    'rejeté': commandes.filter(c => c.statut === 'rejeté').length,
    'réservation': commandes.filter(c => c.statut === 'réservation').length
  }

  // 🔄 GESTION DES COMMANDES
  const modifierStatutCommande = async (commandeId, nouveauStatut) => {
    try {
      console.log('Modification statut commande:', commandeId, nouveauStatut)
      
      const { error } = await supabase
        .from('commandes')
        .update({ statut: nouveauStatut })
        .eq('id', commandeId)

      if (error) {
        console.error('Erreur Supabase:', error)
        throw error
      }

      alert(`✅ Commande ${nouveauStatut} avec succès!`)
      
      // Recharger les données
      await fetchData()
      
    } catch (error) {
      console.error('Erreur mise à jour commande:', error)
      alert('❌ Erreur lors de la mise à jour: ' + error.message)
    }
  }

  // 🗑️ SUPPRIMER UNE COMMANDE
  const supprimerCommande = async (commandeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) return

    try {
      const { error } = await supabase
        .from('commandes')
        .delete()
        .eq('id', commandeId)

      if (error) throw error

      alert('✅ Commande supprimée avec succès!')
      await fetchData()
    } catch (error) {
      console.error('Erreur suppression commande:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  // 🖼️ UPLOAD D'IMAGE
  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await uploadImage(file, 'produits')
      
      if (result.success) {
        if (isEdit && editingProduct) {
          setEditingProduct({
            ...editingProduct,
            image_url: result.publicUrl
          })
        } else {
          setNouveauProduit({
            ...nouveauProduit,
            image_url: result.publicUrl
          })
        }
        alert('✅ Image uploadée avec succès!')
      } else {
        alert('❌ Erreur upload: ' + result.error)
      }
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  // ➕ AJOUTER PRODUIT
  const ajouterProduit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('produits')
        .insert([{
          ...nouveauProduit,
          prix: parseFloat(nouveauProduit.prix),
          disponible: true
        }])
        .select()

      if (error) throw error

      alert('✅ Produit ajouté avec succès!')
      setNouveauProduit({ nom: '', description: '', prix: '', categorie: 'Grillades', image_url: '' })
      await fetchData()
    } catch (error) {
      console.error('Erreur ajout produit:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  // ✏️ MODIFIER PRODUIT
  const modifierProduit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('produits')
        .update({
          ...editingProduct,
          prix: parseFloat(editingProduct.prix)
        })
        .eq('id', editingProduct.id)

      if (error) throw error

      alert('✅ Produit modifié avec succès!')
      setEditingProduct(null)
      await fetchData()
    } catch (error) {
      console.error('Erreur modification produit:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  // 🗑️ SUPPRIMER PRODUIT
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

  // ⭐ VALIDER AVIS
  const validerAvis = async (avisId) => {
    try {
      const { error } = await supabase
        .from('avis')
        .update({ valide: true })
        .eq('id', avisId)

      if (error) throw error

      alert('✅ Avis validé!')
      await fetchData()
    } catch (error) {
      console.error('Erreur validation avis:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  // 🗑️ SUPPRIMER AVIS
  const supprimerAvis = async (avisId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

    try {
      const { error } = await supabase
        .from('avis')
        .delete()
        .eq('id', avisId)

      if (error) throw error

      alert('✅ Avis supprimé!')
      await fetchData()
    } catch (error) {
      console.error('Erreur suppression avis:', error)
      alert('❌ Erreur: ' + error.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-cream">Chargement des données...</p>
        </div>
      </div>
    )
  }

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

        {/* Statistiques */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {[
            { statut: 'tous', label: 'Total', count: statsCommandes.tous, color: 'bg-blue-500' },
            { statut: 'en attente', label: 'En attente', count: statsCommandes['en attente'], color: 'bg-yellow-500' },
            { statut: 'confirmé', label: 'Confirmées', count: statsCommandes['confirmé'], color: 'bg-green-500' },
            { statut: 'rejeté', label: 'Rejetées', count: statsCommandes['rejeté'], color: 'bg-red-500' },
            { statut: 'réservation', label: 'Réservations', count: statsCommandes['réservation'], color: 'bg-purple-500' }
          ].map((stat) => (
            <div 
              key={stat.statut}
              className={`bg-black border border-gold/20 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${
                filtreStatut === stat.statut ? 'ring-2 ring-gold' : ''
              }`}
              onClick={() => setFiltreStatut(stat.statut)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cream font-semibold text-sm">{stat.label}</h3>
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              </div>
              <p className="text-2xl font-bold text-gold">{stat.count}</p>
            </div>
          ))}
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

        {/* Contenu des onglets */}
        <div className="bg-black border border-gold/20 rounded-2xl p-6">
          
          {/* COMMANDES AVEC FILTRES */}
          {activeTab === 'commandes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gold">
                  {filtreStatut === 'tous' ? 'Toutes les commandes' : 
                   filtreStatut === 'en attente' ? 'Commandes en attente' :
                   filtreStatut === 'confirmé' ? 'Commandes confirmées' :
                   filtreStatut === 'rejeté' ? 'Commandes rejetées' : 'Réservations'} 
                  ({commandesFiltrees.length})
                </h2>
                
                <div className="flex items-center space-x-4">
                  <span className="text-cream/60 text-sm">
                    Filtre: <span className="text-gold capitalize">{filtreStatut}</span>
                  </span>
                  <button
                    onClick={() => setFiltreStatut('tous')}
                    className="text-gold hover:text-orange text-sm"
                  >
                    Voir tout
                  </button>
                </div>
              </div>
              
              {commandesFiltrees.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-cream/60 text-xl">
                    {filtreStatut === 'tous' 
                      ? 'Aucune commande pour le moment' 
                      : `Aucune commande avec le statut "${filtreStatut}"`}
                  </p>
                  {filtreStatut !== 'tous' && (
                    <button
                      onClick={() => setFiltreStatut('tous')}
                      className="mt-4 text-gold hover:text-orange"
                    >
                      Voir toutes les commandes
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {commandesFiltrees.map(commande => (
                    <div key={commande.id} className="border border-gold/20 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-gold font-semibold text-lg">
                              {commande.statut === 'réservation' ? '📅 Réservation' : '📦 Commande'} #{commande.id}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              commande.statut === 'confirmé' ? 'bg-green-500' :
                              commande.statut === 'rejeté' ? 'bg-red-500' :
                              commande.statut === 'réservation' ? 'bg-purple-500' :
                              'bg-yellow-500'
                            }`}>
                              {commande.statut}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-cream">
                                <span className="text-gold">👤 Client:</span> {commande.nom_client || 'Non renseigné'}
                              </p>
                              <p className="text-cream">
                                <span className="text-gold">📞 Téléphone:</span> {commande.telephone}
                              </p>
                              <p className="text-cream">
                                <span className="text-gold">📍 Type:</span> {commande.type_commande || 'À emporter'}
                              </p>
                            </div>
                            <div>
                              <p className="text-cream">
                                <span className="text-gold">📅 Date:</span> {new Date(commande.created_at).toLocaleString('fr-FR')}
                              </p>
                              {commande.heure_reservation && (
                                <p className="text-cream">
                                  <span className="text-gold">🕐 Heure réservation:</span> {commande.heure_reservation}
                                </p>
                              )}
                              <p className="text-2xl font-bold text-orange">
                                {commande.total > 0 ? `${commande.total} XOF` : 'Réservation'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Produits commandés (uniquement pour les commandes avec produits) */}
                      {commande.produits && Array.isArray(commande.produits) && commande.produits.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-cream font-semibold mb-3">🛒 Produits commandés:</h4>
                          <div className="space-y-2 bg-dark/50 rounded-lg p-4">
                            {commande.produits.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-cream/80">
                                <div>
                                  <span className="font-medium">{item.nom}</span>
                                  <span className="text-sm ml-2">x{item.quantity}</span>
                                </div>
                                <span>{(item.prix * item.quantity).toLocaleString()} XOF</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Adresse de livraison */}
                      {commande.adresse_livraison && (
                        <div className="mb-4">
                          <h4 className="text-cream font-semibold mb-2">🏠 Adresse de livraison:</h4>
                          <p className="text-cream/80 bg-dark/50 rounded-lg p-3">{commande.adresse_livraison}</p>
                        </div>
                      )}

                      {/* Instructions */}
                      {commande.instructions && (
                        <div className="mb-4">
                          <h4 className="text-cream font-semibold mb-2">💬 Instructions:</h4>
                          <p className="text-cream/80 bg-dark/50 rounded-lg p-3">{commande.instructions}</p>
                        </div>
                      )}

                      {/* Preuve de paiement */}
                      {commande.image_preuve && (
                        <div className="mb-4">
                          <h4 className="text-cream font-semibold mb-3">🧾 Preuve de paiement:</h4>
                          <div className="bg-dark/50 rounded-lg p-4">
                            <img 
                              src={commande.image_preuve} 
                              alt="Preuve de paiement" 
                              className="max-w-xs rounded-lg border border-gold/20"
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions selon le statut */}
                      <div className="flex flex-wrap gap-2 justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                          {commande.statut !== 'confirmé' && (
                            <button
                              onClick={() => modifierStatutCommande(commande.id, 'confirmé')}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                            >
                              ✅ Confirmer
                            </button>
                          )}
                          {commande.statut !== 'rejeté' && (
                            <button
                              onClick={() => modifierStatutCommande(commande.id, 'rejeté')}
                              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                              ❌ Rejeter
                            </button>
                          )}
                          {commande.statut !== 'en attente' && commande.statut !== 'réservation' && (
                            <button
                              onClick={() => modifierStatutCommande(commande.id, 'en attente')}
                              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                            >
                              ⏳ En attente
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => supprimerCommande(commande.id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRODUITS */}
          {activeTab === 'produits' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gold">Gestion des Produits</h2>
                <span className="text-cream/80">{produits.filter(p => p.disponible).length} produits actifs</span>
              </div>

              {/* Formulaire ajout/modification produit */}
              <div className="bg-dark p-6 rounded-lg mb-8 border border-gold/20">
                <h3 className="text-xl font-semibold text-gold mb-4">
                  {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}
                </h3>
                
                <form onSubmit={editingProduct ? modifierProduit : ajouterProduit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nom du produit *"
                      value={editingProduct ? editingProduct.nom : nouveauProduit.nom}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, nom: e.target.value})
                        : setNouveauProduit({...nouveauProduit, nom: e.target.value})
                      }
                      className="bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Prix (XOF) *"
                      value={editingProduct ? editingProduct.prix : nouveauProduit.prix}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, prix: e.target.value})
                        : setNouveauProduit({...nouveauProduit, prix: e.target.value})
                      }
                      className="bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
                      required
                    />
                    <select
                      value={editingProduct ? editingProduct.categorie : nouveauProduit.categorie}
                      onChange={(e) => editingProduct 
                        ? setEditingProduct({...editingProduct, categorie: e.target.value})
                        : setNouveauProduit({...nouveauProduit, categorie: e.target.value})
                      }
                      className="bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold"
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
                    
                    {/* Upload image */}
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
                        {uploadingImage ? '📤 Upload...' : '📸 Choisir image'}
                      </label>
                    </div>
                  </div>

                  {/* Aperçu image */}
                  {(editingProduct?.image_url || nouveauProduit.image_url) && (
                    <div className="mb-4">
                      <p className="text-cream mb-2">Aperçu de l'image:</p>
                      <img 
                        src={editingProduct ? editingProduct.image_url : nouveauProduit.image_url} 
                        alt="Aperçu" 
                        className="w-32 h-32 object-cover rounded-lg border border-gold/20"
                      />
                    </div>
                  )}

                  <textarea
                    placeholder="Description du produit *"
                    value={editingProduct ? editingProduct.description : nouveauProduit.description}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, description: e.target.value})
                      : setNouveauProduit({...nouveauProduit, description: e.target.value})
                    }
                    className="w-full bg-black border border-gold/20 rounded-lg px-4 py-3 text-cream focus:outline-none focus:border-gold mb-4"
                    rows="3"
                    required
                  />

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {editingProduct ? '💾 Sauvegarder' : '➕ Ajouter le produit'}
                    </button>
                    
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      >
                        ❌ Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Liste des produits */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produits.filter(p => p.disponible).map(produit => (
                  <div key={produit.id} className="border border-gold/20 rounded-lg p-4">
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
                          className="w-16 h-16 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(produit)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex-1"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => supprimerProduit(produit.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex-1"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVIS */}
          {activeTab === 'avis' && (
            <div>
              <h2 className="text-2xl font-semibold text-gold mb-6">
                Avis Clients ({avis.length})
              </h2>
              
              {avis.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-cream/60 text-xl">Aucun avis pour le moment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {avis.map(avisItem => (
                    <div key={avisItem.id} className="border border-gold/20 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-gold font-semibold text-lg">
                              {avisItem.nom_client || 'Client Anonyme'}
                            </h3>
                            <div className="flex text-yellow-400">
                              {'★'.repeat(avisItem.note)}{'☆'.repeat(5 - avisItem.note)}
                            </div>
                          </div>
                          
                          <p className="text-cream/80 italic text-lg mb-2">
                            "{avisItem.message}"
                          </p>
                          
                          <p className="text-cream/60 text-sm">
                            📅 {new Date(avisItem.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          avisItem.valide ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {avisItem.valide ? 'Validé' : 'En attente'}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!avisItem.valide && (
                          <button
                            onClick={() => validerAvis(avisItem.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            ✅ Valider l'avis
                          </button>
                        )}
                        <button
                          onClick={() => supprimerAvis(avisItem.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
