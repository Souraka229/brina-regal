'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Compte() {
  const [client, setClient] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('commandes')
  const router = useRouter()

  useEffect(() => {
    checkClient()
  }, [])

  const checkClient = async () => {
    const clientData = localStorage.getItem('client')
    if (!clientData) {
      router.push('/connexion')
      return
    }
    
    setClient(JSON.parse(clientData))
    await fetchCommandes(JSON.parse(clientData).id)
  }

  const fetchCommandes = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCommandes(data || [])
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deconnexion = () => {
    localStorage.removeItem('client')
    router.push('/')
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-poppins font-bold gradient-text"
          >
            Mon Compte
          </motion.h1>
          
          <div className="flex gap-4">
            <Link 
              href="/menu"
              className="bg-gold text-dark px-6 py-2 rounded-full font-semibold hover:bg-orange transition-colors"
            >
              Commander
            </Link>
            <button
              onClick={deconnexion}
              className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Informations client */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-gold/20 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gold mb-4">Mes Informations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-cream"><span className="text-gold">👤 Nom:</span> {client.nom}</p>
              <p className="text-cream"><span className="text-gold">📧 Email:</span> {client.email}</p>
            </div>
            <div>
              <p className="text-cream"><span className="text-gold">📞 Téléphone:</span> {client.telephone}</p>
              <p className="text-cream"><span className="text-gold">📍 Adresse:</span> {client.adresse || 'Non renseignée'}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation onglets */}
        <div className="flex space-x-4 mb-8 border-b border-gold/20">
          {['commandes', 'favoris'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-6 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-cream/60 hover:text-cream'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenu onglets */}
        <div className="bg-black border border-gold/20 rounded-2xl p-6">
          {/* Commandes */}
          {activeTab === 'commandes' && (
            <div>
              <h2 className="text-2xl font-semibold text-gold mb-6">
                Mes Commandes ({commandes.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
                  <p className="text-cream/60">Chargement des commandes...</p>
                </div>
              ) : commandes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-cream/60 text-xl mb-4">Aucune commande pour le moment</p>
                  <Link 
                    href="/menu"
                    className="bg-gradient-to-r from-gold to-orange text-dark px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Passer ma première commande
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {commandes.map(commande => (
                    <div key={commande.id} className="border border-gold/20 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-gold font-semibold text-lg mb-2">
                            Commande #{commande.id}
                          </h3>
                          <p className="text-cream/60 text-sm">
                            📅 {new Date(commande.created_at).toLocaleString('fr-FR')}
                          </p>
                          <p className="text-cream">
                            📍 {commande.lieu_livraison}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange mb-2">
                            {commande.total} XOF
                          </p>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            commande.statut === 'confirmé' ? 'bg-green-500' :
                            commande.statut === 'rejeté' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            {commande.statut}
                          </span>
                        </div>
                      </div>
                      
                      {/* Produits commandés */}
                      <div className="mb-4">
                        <h4 className="text-cream font-semibold mb-3">Produits commandés:</h4>
                        <div className="space-y-2 bg-dark/50 rounded-lg p-4">
                          {Array.isArray(commande.produits) && commande.produits.map((item, index) => (
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

                      {/* Suivi de commande */}
                      <div className="bg-gold/10 rounded-lg p-4">
                        <h4 className="text-gold font-semibold mb-3">📦 Suivi de commande</h4>
                        <div className="flex items-center justify-between">
                          <div className={`text-center ${commande.statut === 'en attente' ? 'text-gold' : 'text-cream/60'}`}>
                            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center mx-auto mb-1">
                              ⏳
                            </div>
                            <span className="text-xs">En attente</span>
                          </div>
                          <div className={`text-center ${commande.statut === 'confirmé' ? 'text-gold' : 'text-cream/60'}`}>
                            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center mx-auto mb-1">
                              ✅
                            </div>
                            <span className="text-xs">Confirmée</span>
                          </div>
                          <div className={`text-center ${commande.statut === 'rejeté' ? 'text-red-400' : 'text-cream/60'}`}>
                            <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-1">
                              ❌
                            </div>
                            <span className="text-xs">Annulée</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favoris */}
          {activeTab === 'favoris' && (
            <div>
              <h2 className="text-2xl font-semibold text-gold mb-6">Mes Favoris</h2>
              <div className="text-center py-12">
                <p className="text-cream/60 text-xl mb-4">Fonctionnalité à venir</p>
                <p className="text-cream/40">Bientôt, vous pourrez sauvegarder vos plats préférés !</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
