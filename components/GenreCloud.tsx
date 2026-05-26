'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Mapeo de géneros a iconos de Font Awesome (opcional)
const genreIcons: Record<string, string> = {
  'Acción': 'fa-fist-raised',
  'Aventura': 'fa-mountain',
  'Animación': 'fa-film',
  'Comedia': 'fa-laugh-squint',
  'Drama': 'fa-mask',
  'Fantasía': 'fa-dragon',
  'Ciencia Ficción': 'fa-rocket',
  'Terror': 'fa-ghost',
  'Suspense': 'fa-skull',
  'Romance': 'fa-heart',
  'Familiar': 'fa-child',
  'Documental': 'fa-video',
  'Musical': 'fa-music',
  'Western': 'fa-horse',
  'Crimen': 'fa-gavel',
  'Novelas': 'fa-book',
};

export default function GenreCloud() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => {
        setGenres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading genres:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <i className="fas fa-tags text-blue-500"></i> Descubre por estilo
        </h2>
        <div className="flex flex-wrap gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (genres.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <i className="fas fa-tags text-blue-500"></i> Descubre por estilo
        </h2>
        <Link
          href="/explore"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Explorar colección completa <i className="fas fa-arrow-right text-xs"></i>
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => {
          const iconClass = genreIcons[genre] || 'fa-tag';
          return (
            <Link
              key={genre}
              href={`/explore?genre=${encodeURIComponent(genre)}`}
              className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <i className={`fas ${iconClass} text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm`}></i>
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium">
                {genre}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}