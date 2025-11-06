'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchPopularProducts()
    fetchValidReviews()
  }, [])

  const fetchPopularProducts = async () => {
    try {
      const { data } = await supabase
        .from('produits')
        .select('*')
        .limit(6)
      setPopularProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setPopularProducts([])
    }
  }

  const fetchValidReviews = async () => {
    try {
      const { data } = await supabase
        .from('avis')
        .select('*')
        .eq('valide', true)
        .limit(5)
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-dark to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-gold/10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-poppins font-bold mb-6"
          >
            <span className="gradient-text">Le goût royal</span>
            <br />
            <span className="text-cream">d'Abomey-Calavi</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-cream/80 mb-8 max-w-2xl mx-auto"
          >
            Découvrez une expérience culinaire exceptionnelle au cœur de Dekoungbé
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Link 
              href="/menu"
              className="inline-block bg-gradient-to-r from-gold to-orange text-dark px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Découvrir le menu
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Le reste du code de la page d'accueil reste identique */}
      {/* ... */}
    </div>
  )
}
