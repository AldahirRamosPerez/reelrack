'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

import Image from 'next/image';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { token, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const closeMenu = () => setIsMenuOpen(false);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ReelRack" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ReelRack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/explore">Explorar</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            {token && <NavLink href="/add">Añadir</NavLink>}
            {token ? (
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                Cerrar sesión
              </button>
            ) : (
              <NavLink href="/admin/login">Admin</NavLink>
            )}
            <ThemeToggleButton theme={theme} setTheme={setTheme} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggleButton theme={theme} setTheme={setTheme} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/explore" onClick={closeMenu}>Explorar</MobileNavLink>
              <MobileNavLink href="/dashboard" onClick={closeMenu}>Dashboard</MobileNavLink>
              {token && <MobileNavLink href="/add" onClick={closeMenu}>Añadir</MobileNavLink>}
              {token ? (
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition px-2 py-1"
                >
                  Cerrar sesión
                </button>
              ) : (
                <MobileNavLink href="/admin/login" onClick={closeMenu}>Admin</MobileNavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Componente para enlaces de escritorio
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm"
    >
      {children}
    </Link>
  );
}

// Componente para enlaces móvil
function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-2 py-1 text-base"
    >
      {children}
    </Link>
  );
}

// Componente del botón de tema
function ThemeToggleButton({ theme, setTheme }: { theme: string | undefined; setTheme: (theme: string) => void }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? (
        <i className="fas fa-sun text-yellow-400"></i>
      ) : (
        <i className="fas fa-moon text-gray-700"></i>
      )}
    </button>
  );
}