'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Title {
  id: number;
  title: string;
  overview: string;
  poster_url: string | null;
  rating: number;
  year: number;
  genres: string;
  categoria: string;
}

export default function Hero() {
  const [hero, setHero] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRandomTitle = async () => {
    setLoading(true);
    setError(false);
    try {
      // Obtener un lote grande de títulos (ej. 200) para tener variedad
      const res = await fetch('/api/titles?limit=5000');
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        // Selección completamente aleatoria (sin priorizar rating)
        const randomIndex = Math.floor(Math.random() * data.data.length);
        const randomTitle = data.data[randomIndex];
        setHero(randomTitle);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomTitle();
  }, []);

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden mb-8 h-96 md:h-[500px] w-full bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
    );
  }

  if (error || !hero) {
    return (
      <div className="relative rounded-2xl overflow-hidden mb-8 h-96 md:h-[500px] w-full bg-gray-900 flex items-center justify-center">
        <p className="text-white text-center px-4">
          No se pudo cargar la recomendación.{' '}
          <button onClick={fetchRandomTitle} className="underline">
            Reintentar
          </button>
        </p>
      </div>
    );
  }

  const genreList = hero.genres?.split('|').slice(0, 3).join(' • ') || '';

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-[70vh] min-h-[500px] w-full group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${
            hero.poster_url
              ? hero.poster_url.replace('/w500', '/original')
              : 'https://placehold.co/1920x1080/1e1e2f/white?text=ReelRack'
          })`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10 lg:p-12 text-white max-w-2xl">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <i className="fas fa-star text-xs"></i> {hero.rating?.toFixed(1) || 'N/A'}
          </span>
          <span className="bg-gray-800/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full">
            {hero.year}
          </span>
          {hero.categoria && (
            <span className="bg-gray-800/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full">
              {hero.categoria}
            </span>
          )}
          {genreList && (
            <span className="bg-gray-800/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full">
              {genreList}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
          {hero.title}
        </h1>
        <p className="text-sm md:text-base mt-3 line-clamp-3 text-gray-200 max-w-xl drop-shadow">
          {hero.overview?.substring(0, 180)}...
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href={`/title/${hero.id}`}
            className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg"
          >
            <i className="fas fa-play"></i> Explorar obra
          </Link>
          <button
            onClick={fetchRandomTitle}
            className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 px-6 py-2 rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            <i className="fas fa-sync-alt"></i> Sugerir otra
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-white text-xl opacity-70"></i>
      </div>
    </div>
  );
}