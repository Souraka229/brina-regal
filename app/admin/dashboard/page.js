'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient'
import { uploadImage } from '../../../lib/uploadImage'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('tableau')
  const [commandes, setCommandes] = useState([])
  const [produits, setProduits] = useState([])
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const router = useRouter()

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

  // 📊 STATISTIQUES EN TEMPS RÉEL
  const stats = {
    commandes: {
      total: commandes.length,
      enAttente: commandes.filter(c => c.statut === 'en attente').length,
      confirmees: commandes.filter(c => c.statut === 'confirmé').length,
      rejetees: commandes.filter(c => c.statut === 'rejeté').length,
      reservations: commandes.filter(c => c.statut === 'réservation').length
    },
    revenus: {
      total: commandes.filter(c => c.statut === 'confirmé').reduce((sum, cmd) => sum + parseFloat(cmd.total || 0), 0),
      aujourdhui: commandes
        .filter(c => c.statut === 'confirmé' && new Date(c.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, cmd) => sum + parseFloat(cmd.total || 0), 0)
    },
    produits: {
      total: produits.filter(p => p.disponible).length,
      categories: [...new Set(produits.map(p => p.categorie))].length
    },
    avis: {
      total: avis.length,
      enAttente: avis.filter(a => !a.valide).length,
      moyenne: avis.length > 0 ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1) : 0
    }
  }

  // 📈 DONNÉES POUR GRAPHIQUES
  const donneesCommandes = [
    { jour: 'Lun', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 1).length },
    { jour: 'Mar', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 2).length },
    { jour: 'Mer', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 3).length },
    { jour: 'Jeu', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 4).length },
    { jour: 'Ven', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 5).length },
    { jour: 'Sam', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 6).length },
    { jour: 'Dim', commandes: commandes.filter(c => new Date(c.created_at).getDay() === 0).length }
  ]

  const donneesStatuts = [
    { name: 'Confirmées', value: stats.commandes.confirmees },
    { name: 'En attente', value: stats.commandes.enAttente },
    { name: 'Rejetées', value: stats.commandes.rejetees },
    { name: 'Réservations', value: stats.commandes.reservations }
  ]

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // 🔄 FONCTIONS DE GESTION
  const modifierStatutCommande = async (commandeId, nouveauStatut) => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: nouveauStatut })
        .eq('id', commandeId)

      if (error) throw error

      await fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await uploadImage(file, 'produits')
      
      if (result.success) {
        if (isEdit && editingProduct) {
          setEditingProduct({...editingProduct, image_url: result.publicUrl})
        } else {
          setNouveauProduit({...nouveauProduit, image_url: result.publicUrl})
        }
      } else {
        alert('Erreur: ' + result.error)
      }
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const ajouterProduit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('produits')
        .insert([{
          ...nouveauProduit,
          prix: parseFloat(nouveauProduit.prix),
          disponible: true
        }])

      if (error) throw error

      setNouveauProduit({ nom: '', description: '', prix: '', categorie: 'Grillades', image_url: '' })
      await fetchData()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

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

      setEditingProduct(null)
      await fetchData()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const supprimerProduit = async (produitId) => {
    if (!confirm('Supprimer ce produit ?')) return

    try {
      const { error } = await supabase
        .from('produits')
        .update({ disponible: false })
        .eq('id', produitId)

      if (error) throw error

      await fetchData()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
              <p className="text-gray-500">Gestion Brina'Régal</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('admin')
                router.push('/admin/login')
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'tableau', name: '📊 Tableau de bord', icon: '📊' },
              { id: 'commandes', name: '📦 Commandes', icon: '📦' },
              { id: 'produits', name: '🍽️ Produits', icon: '🍽️' },
              { id: 'avis', name: '⭐ Avis', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        ) : (

          /* 📊 TABLEAU DE BORD */
          activeTab === 'tableau' && (
            <div className="space-y-6">
              {/* Cartes Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Commandes Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.commandes.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.revenus.total.toLocaleString()} XOF</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Produits Actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.produits.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.avis.moyenne}/5</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commandes par jour */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes par Jour</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donneesCommandes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="jour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="commandes" fill="#FFD700" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Répartition des statuts */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des Commandes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={donneesStatuts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {donneesStatuts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dernières commandes */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières Commandes</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commandes.slice(0, 5).map((commande) => (
                        <tr key={commande.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{commande.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{commande.nom_client}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              commande.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                              commande.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {commande.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{commande.total} XOF</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )

          /* 📦 COMMANDES */
          activeTab === 'commandes' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des Commandes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commandes.map((commande) => (
                      <tr key={commande.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{commande.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{commande.nom_client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{commande.telephone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            commande.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                            commande.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {commande.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{commande.total} XOF</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => modifierStatutCommande(commande.id, 'confirmé')}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => modifierStatutCommande(commande.id, 'rejeté')}
                            className="text-red-600 hover:text-red-900"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )

          /* 🍽️ PRODUITS */
          activeTab === 'produits' && (
            <div className="space-y-6">
              {/* Formulaire */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                </h3>
                <form onSubmit={editingProduct ? modifierProduit : ajouterProduit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={editingProduct ? editingProduct.nom : nouveauProduit.nom}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, nom: e.target.value})
                      : setNouveauProduit({...nouveauProduit, nom: e.target.value})
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Prix (XOF)"
                    value={editingProduct ? editingProduct.prix : nouveauProduit.prix}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, prix: e.target.value})
                      : setNouveauProduit({...nouveauProduit, prix: e.target.value})
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                  <select
                    value={editingProduct ? editingProduct.categorie : nouveauProduit.categorie}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, categorie: e.target.value})
                      : setNouveauProduit({...nouveauProduit, categorie: e.target.value})
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  >
                    <option value="Grillades">Grillades</option>
                    <option value="Plats Principaux">Plats Principaux</option>
                    <option value="Plats Traditionnels">Plats Traditionnels</option>
                    <option value="Boissons">Boissons</option>
                  </select>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, !!editingProduct)}
                      className="hidden"
                      id="product-image"
                    />
                    <label
                      htmlFor="product-image"
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer block text-center"
                    >
                      {uploadingImage ? 'Upload...' : 'Choisir image'}
                    </label>
                  </div>
                  <textarea
                    placeholder="Description"
                    value={editingProduct ? editingProduct.description : nouveauProduit.description}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, description: e.target.value})
                      : setNouveauProduit({...nouveauProduit, description: e.target.value})
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold md:col-span-2"
                    rows="3"
                    required
                  />
                  <div className="md:col-span-2 space-x-4">
                    <button
                      type="submit"
                      className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-orange transition-colors"
                    >
                      {editingProduct ? 'Modifier' : 'Ajouter'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Liste des produits */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Produits ({stats.produits.total})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {produits.filter(p => p.disponible).map((produit) => (
                        <tr key={produit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {produit.image_url && (
                                <img src={produit.image_url} alt={produit.nom} className="w-10 h-10 rounded-lg object-cover mr-3" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{produit.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produit.categorie}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produit.prix} XOF</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setEditingProduct(produit)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => supprimerProduit(produit.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
