import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/src/context/CartContext'
import Navbar from '@/components/Navbar'
import FooterClient from '@/components/FooterClient'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Amaretto Jewelry - Joyería Elegante y Minimalista',
  description: 'Joyería en acero inoxidable y chapa de oro. Piezas hipoalergénicas elegantes y minimalistas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <FooterClient />
        </CartProvider>
      </body>
    </html>
  )
}

