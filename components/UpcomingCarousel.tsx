'use client';
import { useEffect, useState } from 'react';
import TitleCard from './TitleCard';

export default function UpcomingCarousel() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch('/api/upcoming/movies?page=1');
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUpcoming();
  }, []);

  if (movies.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
        <i className="fas fa-calendar-alt text-red-500"></i> Próximos estrenos en cines
      </h2>
      <div className="flex overflow-x-auto gap-4 pb-4">
        {movies.map((movie: any) => (
          <TitleCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            year={movie.release_date?.slice(0, 4) || 'Próximamente'}
            poster_url={movie.poster_url}
          />
        ))}
      </div>
    </div>
  );
}