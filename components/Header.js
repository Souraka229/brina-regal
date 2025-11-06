'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [client, setClient] = useState(null)

  // Charger les informations du client depuis le localStorage
  useEffect(() => {
    const clientData = localStorage.getItem('client')
    if (clientData) {
      setClient(JSON.parse(clientData))
    }
  }, [])

  return (
    <header className="bg-dark/90 backdrop-blur-md fixed w-full z-50 border-b border-gold/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-gold to-orange rounded-full flex items-center justify-center">
              <span className="text-dark font-bold text-sm">BR</span>
            </div>
            <span className="text-2xl font-poppins font-bold gradient-text">
              Brina'Régal
            </span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-cream hover:text-gold transition-colors duration-300">
              Accueil
            </Link>
            <Link href="/menu" className="text-cream hover:text-gold transition-colors duration-300">
              Menu
            </Link>
            <Link 
              href="/menu" 
              className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Commander
            </Link>

            {/* CTA client */}
            {client ? (
              <Link 
                href="/compte"
                className="text-cream hover:text-gold transition-colors duration-300"
              >
                Mon Compte
              </Link>
            ) : (
              <>
                <Link 
                  href="/connexion" 
                  className="text-cream hover:text-gold transition-colors duration-300"
                >
                  Connexion
                </Link>
                <Link 
                  href="/inscription"
                  className="border border-gold text-gold px-4 py-2 rounded-full hover:bg-gold hover:text-dark transition-all duration-300"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Menu mobile */}
          <button 
            className="md:hidden text-cream text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Menu mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-4 pb-4"
            >
              <Link 
                href="/" 
                className="block text-cream hover:text-gold py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/menu" 
                className="block text-cream hover:text-gold py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                href="/menu" 
                className="block bg-gradient-to-r from-gold to-orange text-dark px-4 py-3 rounded-full text-center font-semibold mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Commander
              </Link>

              {/* CTA mobile */}
              {client ? (
                <Link
                  href="/compte"
                  className="block text-cream hover:text-gold py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon Compte
                </Link>
              ) : (
                <>
                  <Link 
                    href="/connexion" 
                    className="block text-cream hover:text-gold py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/inscription"
                    className="block border border-gold text-gold px-4 py-2 rounded-full hover:bg-gold hover:text-dark transition-all mt-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
