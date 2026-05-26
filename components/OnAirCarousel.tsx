'use client';
import { useEffect, useState } from 'react';
import TitleCard from './TitleCard';

export default function OnAirCarousel() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    async function fetchOnAir() {
      try {
        const res = await fetch('/api/upcoming/tv?page=1');
        const data = await res.json();
        setSeries(data.results || []);
      } catch (err) {
        console.error('Error fetching on air TV:', err);
      }
    }
    fetchOnAir();
  }, []);

  if (series.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
        <i className="fas fa-tv text-green-500"></i> Series en emisión
      </h2>
      <div className="flex overflow-x-auto gap-4 pb-4">
        {series.map((serie: any) => (
          <TitleCard
            key={serie.id}
            id={serie.id}
            title={serie.title}
            year={serie.release_date?.slice(0, 4) || 'En emisión'}
            poster_url={serie.poster_url}
          />
        ))}
      </div>
    </div>
  );
}