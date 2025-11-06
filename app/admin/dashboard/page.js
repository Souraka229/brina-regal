'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'admin est connecté
    const admin = localStorage.getItem('admin')
    if (!admin) {
      router.push('/admin/login')
    } else {
      setIsAdmin(true)
    }
  }, [router])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-poppins font-bold mb-8 gradient-text">
          Tableau de Bord Admin
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border border-gold/20 rounded-2xl p-6">
            <h3 className="text-gold font-semibold mb-2">Commandes aujourd'hui</h3>
            <p className="text-3xl font-bold text-cream">0</p>
          </div>
          
          <div className="bg-black border border-gold/20 rounded-2xl p-6">
            <h3 className="text-gold font-semibold mb-2">Revenus estimés</h3>
            <p className="text-3xl font-bold text-cream">0 XOF</p>
          </div>
          
          <div className="bg-black border border-gold/20 rounded-2xl p-6">
            <h3 className="text-gold font-semibold mb-2">Avis en attente</h3>
            <p className="text-3xl font-bold text-cream">0</p>
          </div>
        </div>

        <div className="bg-black border border-gold/20 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-gold mb-4">Fonctionnalités à venir</h2>
          <ul className="text-cream/80 space-y-2">
            <li>✅ Gestion des commandes</li>
            <li>✅ Statistiques détaillées</li>
            <li>✅ Gestion des produits</li>
            <li>✅ Validation des avis</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
