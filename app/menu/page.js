'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function Menu() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const { addItem, getTotalItems } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('disponible', true)
        .order('nom')

      if (error) throw error

      if (data) {
        setProducts(data)
        const uniqueCategories = ['Tous', ...new Set(data.map(p => p.categorie))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.categorie === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec compteur panier */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-poppins font-bold gradient-text"
          >
            Notre Menu
          </motion.h1>
          
          <Link 
            href="/panier"
            className="relative bg-gradient-to-r from-gold to-orange text-dark px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            🛒 Panier
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-gold to-orange text-dark'
                  : 'bg-dark border border-gold/20 text-cream hover:bg-gold/10'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Liste des produits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-black border border-gold/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gold/20 to-orange/20 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-cream/50">🍽️ {product.nom}</span>
              </div>
              <h3 className="text-xl font-semibold text-gold mb-2">{product.nom}</h3>
              <p className="text-cream/70 mb-4 text-sm line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange">{product.prix} XOF</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addItem(product)}
                  className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Ajouter
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-cream/60 text-xl">Aucun produit dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}
