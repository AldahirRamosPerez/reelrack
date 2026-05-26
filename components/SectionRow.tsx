'use client';
import { useRef } from 'react';
import TitleCard from './TitleCard';

interface SectionRowProps {
  title: string;
  icon?: string;
  items: any[];
  color?: string; // clase de color para el icono (ej. "text-red-500")
}

export default function SectionRow({ title, icon = 'fa-film', items, color = 'text-blue-500' }: SectionRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items.length) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <i className={`fas ${icon} ${color}`}></i>
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition"
            aria-label="Desplazar izquierda"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition"
            aria-label="Desplazar derecha"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-40 md:w-48">
            <TitleCard
              id={item.id}
              title={item.title}
              year={item.year}
              rating={item.rating}
              poster_url={item.poster_url}
            />
          </div>
        ))}
      </div>
    </div>
  );
}