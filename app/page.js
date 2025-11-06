'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchPopularProducts()
    fetchValidReviews()
  }, [])

  const fetchPopularProducts = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .limit(6)
    setPopularProducts(data || [])
  }

  const fetchValidReviews = async () => {
    const { data } = await supabase
      .from('avis')
      .select('*')
      .eq('valide', true)
      .limit(5)
    setReviews(data || [])
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-dark to-black overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(/banner.jpg)',
          }}
        ></div>
        
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

      {/* Plats populaires */}
      <section className="py-20 bg-dark">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-poppins font-bold text-center mb-12 gradient-text"
          >
            Nos Spécialités
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-black border border-gold/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-full h-48 bg-gradient-to-br from-gold/20 to-orange/20 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-cream/50">Image du plat</span>
                </div>
                <h3 className="text-xl font-semibold text-gold mb-2">{product.nom}</h3>
                <p className="text-cream/70 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange">{product.prix} XOF</span>
                  <Link 
                    href="/menu"
                    className="bg-gold text-dark px-4 py-2 rounded-full hover:bg-orange transition-colors duration-300"
                  >
                    Commander
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link 
              href="/menu"
              className="inline-block border-2 border-gold text-gold px-8 py-3 rounded-full hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Voir tout le menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* À propos & Horaires */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-poppins font-bold gradient-text mb-6">
                Notre Histoire
              </h2>
              <p className="text-cream/80 text-lg leading-relaxed mb-6">
                Brina'Régal, c'est bien plus qu'un restaurant. C'est une passion pour la cuisine 
                béninoise revisitée avec une touche moderne. Situé au cœur de Dekoungbé à Abomey-Calavi, 
                nous nous engageons à vous offrir des saveurs authentiques dans un cadre chaleureux.
              </p>
              <p className="text-cream/80 text-lg leading-relaxed">
                Notre équipe de chefs passionnés travaille chaque jour pour vous proposer des plats 
                exceptionnels préparés avec des ingrédients frais et locaux.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-dark border border-gold/20 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-poppins font-bold text-gold mb-6">Horaires d'ouverture</h3>
              <div className="space-y-4">
                {['Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((jour) => (
                  <div key={jour} className="flex justify-between items-center py-2 border-b border-gold/10">
                    <span className="text-cream">{jour}</span>
                    <span className="text-gold font-semibold">13h00 - 00h00</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-cream/60">Lundi</span>
                  <span className="text-red-500 font-semibold">Fermé</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gold/10 rounded-lg">
                <h4 className="text-gold font-semibold mb-2">📍 Adresse</h4>
                <p className="text-cream">Dekoungbé, Abomey-Calavi</p>
                <p className="text-cream/80 text-sm mt-1">À proximité du marché central</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Avis clients */}
      <section className="py-20 bg-dark">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-poppins font-bold text-center mb-12 gradient-text"
          >
            Ils Nous Font Confiance
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black border border-gold/20 rounded-2xl p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gold to-orange rounded-full flex items-center justify-center text-dark font-bold mr-4">
                      {review.nom_client?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="text-gold font-semibold">{review.nom_client || 'Client'}</h4>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.note)}{'☆'.repeat(5 - review.note)}
                      </div>
                    </div>
                  </div>
                  <p className="text-cream/80 italic">"{review.message}"</p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-cream/60 text-xl">Soyez le premier à laisser un avis !</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
