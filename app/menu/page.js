'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .eq('disponible', true);
    
    if (data) {
      setProducts(data);
      const uniqueCategories = ['Tous', ...new Set(data.map(p => p.categorie))];
      setCategories(uniqueCategories);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.categorie === selectedCategory);

  const total = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);

  return (
    <div className="min-h-screen bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-poppins font-bold text-center mb-8 gradient-text"
        >
          Notre Menu
        </motion.h1>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-gold to-orange text-dark'
                  : 'bg-dark border border-gold/20 text-cream hover:bg-gold/10'
              }`}
            >
              {category}
            </button>
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
              whileHover={{ scale: 1.05 }}
              className="bg-black border border-gold/20 rounded-2xl p-6 hover:shadow-2xl transition-all"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gold/20 to-orange/20 rounded-xl mb-4"></div>
              <h3 className="text-xl font-semibold text-gold mb-2">{product.nom}</h3>
              <p className="text-cream/70 mb-4 text-sm">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange">{product.prix} XOF</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                  className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Ajouter
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Panier flottant */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-gold to-orange text-dark p-6 rounded-2xl shadow-2xl"
        >
          <div className="text-center">
            <p className="font-semibold mb-2">{cart.length} article(s)</p>
            <p className="text-2xl font-bold mb-4">{total} XOF</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-dark text-gold px-8 py-3 rounded-full font-semibold hover:bg-black transition-colors"
            >
              Commander
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
