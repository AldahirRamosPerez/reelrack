'use client';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Logo y descripción */}
          <div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ReelRack
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Tu catálogo multimedia personal. Organiza, descubre y comparte tus películas, series, novelas y anime favoritos.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Catálogo completo</Link></li>
              <li><Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Estadísticas</Link></li>
              <li><Link href="/add" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Añadir título</Link></li>
            </ul>
          </div>

          {/* Columna 3: Recursos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">TMDb API</a></li>
              <li><a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Next.js</a></li>
              <li><a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Tailwind CSS</a></li>
            </ul>
          </div>

          {/* Columna 4: Redes sociales y contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sígueme</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/AldahirRamosPerez" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-xl">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-xl">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-xl">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              ¿Preguntas? <a href="mailto:lic.aldahir.ramos@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contáctanos</a>
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {currentYear} ReelRack – Creado por Miguel Aldahir Ramos Pérez. Todos los derechos reservados.</p>
          <p className="mt-1">Hecho con <i className="fas fa-heart text-red-500"></i> para cinéfilos apasionados.</p>
        </div>
      </div>
    </footer>
  );
}