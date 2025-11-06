'use client'
import { motion } from 'framer-motion'

export default function MenuCard({ product, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-black border border-gold/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
    >
      <div className="w-full h-48 bg-gradient-to-br from-gold/20 to-orange/20 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-cream/50">Image du plat</span>
      </div>
      <h3 className="text-xl font-semibold text-gold mb-2">{product.nom}</h3>
      <p className="text-cream/70 mb-4 text-sm line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-orange">{product.prix} XOF</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAddToCart(product)}
          className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
        >
          Ajouter
        </motion.button>
      </div>
    </motion.div>
  )
}
