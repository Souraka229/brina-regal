import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: "Brina'Régal - Le goût royal d'Abomey-Calavi",
  description: 'Restaurant Brina Régal à Dekoungbé, Abomey-Calavi. Commandez en ligne vos plats préférés.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
