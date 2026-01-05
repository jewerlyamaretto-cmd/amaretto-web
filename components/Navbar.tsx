'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/src/context/CartContext'
import MiniCarrito from './MiniCarrito'
import Logo from './Logo'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems, setIsOpen } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-amaretto-white border-b border-amaretto-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo width={150} height={45} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
            >
              Inicio
            </Link>
            <Link
              href="/coleccion"
              className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
            >
              Colección
            </Link>
            <Link
              href="/nuevo"
              className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200 font-semibold"
            >
              Nuevo
            </Link>
            <Link
              href="/nosotros"
              className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
            >
              Nosotros
            </Link>
            <Link
              href="/contacto"
              className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
            >
              Contacto
            </Link>
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 hover:text-amaretto-pink transition-colors duration-200"
            aria-label="Carrito de compras"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-amaretto-pink text-white text-xs font-sans font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-amaretto-gray-light">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/coleccion"
                className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Colección
              </Link>
              <Link
                href="/nuevo"
                className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Nuevo
              </Link>
              <Link
                href="/nosotros"
                className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                className="text-amaretto-black hover:text-amaretto-pink transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
      <MiniCarrito />
    </nav>
  )
}

