export default function Footer() {
  return (
    <footer className="bg-dark border-t border-gold/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-poppins font-bold gradient-text mb-4">
              Brina'Régal
            </h3>
            <p className="text-cream/80">
              Le goût royal d'Abomey-Calavi
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gold mb-4">Contact</h4>
            <p className="text-cream/80">📧 brinaregal02@gmail.com</p>
            <p className="text-cream/80">📞 01 55 55 73 09</p>
            <p className="text-cream/80 mt-2">Dekoungbé, Abomey-Calavi</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gold mb-4">Horaires</h4>
            <p className="text-cream/80">Mardi au Dimanche</p>
            <p className="text-cream/80">13h00 - 00h00</p>
            <p className="text-cream/60 text-sm mt-2">Lundi : Fermé</p>
          </div>
        </div>
        
        <div className="border-t border-gold/20 mt-8 pt-8 text-center text-cream/60">
          <p>&copy; 2024 Brina'Régal. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
