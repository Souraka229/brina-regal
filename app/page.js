'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchPopularProducts();
    fetchValidReviews();
  }, []);

  const fetchPopularProducts = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .limit(6);
    setPopularProducts(data || []);
  };

  const fetchValidReviews = async () => {
    const { data } = await supabase
      .from('avis')
      .select('*')
      .eq('valide', true)
      .limit(5);
    setReviews(data || []);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-dark to-black">
        <div 
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
          <h1 className="text-5xl md:text-7xl font-poppins font-bold mb-6">
            <span className="gradient-text">Le goût royal</span>
            <br />
            <span className="text-cream">d'Abomey-Calavi</span>
          </h1>
          <p className="text-xl text-cream/80 mb-8 max-w-2xl mx-auto">
            Découvrez une expérience culinaire exceptionnelle au cœur de Dekoungbé
          </p>
          <Link 
            href="/menu"
            className="inline-block bg-gradient-to-r from-gold to-orange text-dark px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Découvrir le menu
          </Link>
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
          
          <div className="grid md:grid-cols-3 gap-8">
            {popularProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-dark border border-gold/20 rounded-2xl p-6 hover:shadow-2xl transition-all"
              >
                <div className="w-full h-48 bg-gradient-to-br from-gold/20 to-orange/20 rounded-xl mb-4"></div>
                <h3 className="text-xl font-semibold text-gold mb-2">{product.nom}</h3>
                <p className="text-cream/70 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange">{product.prix} XOF</span>
                  <button className="bg-gold text-dark px-4 py-2 rounded-full hover:bg-orange transition-colors">
                    Ajouter
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* À propos & Horaires */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-poppins font-bold gradient-text mb-6">
                Notre Histoire
              </h2>
              <p className="text-cream/80 text-lg leading-relaxed">
                Brina'Régal, c'est bien plus qu'un restaurant. C'est une passion pour la cuisine 
                béninoise revisitée avec une touche moderne. Situé au cœur de Dekoungbé à Abomey-Calavi, 
                nous nous engageons à vous offrir des saveurs authentiques dans un cadre chaleureux.
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
            Avis Clients
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
