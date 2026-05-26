'use client';
import { useRef } from 'react';
import TitleCard from './TitleCard';

interface CarouselProps {
  title: string;
  items?: any[];
  type?: 'random' | 'upcoming';
}

export default function Carousel({ title, items, type }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold flex items-center gap-2"><i className="fas fa-film text-blue-500"></i> {title}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="bg-gray-200 dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"><i className="fas fa-chevron-left text-sm"></i></button>
          <button onClick={() => scroll('right')} className="bg-gray-200 dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"><i className="fas fa-chevron-right text-sm"></i></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto gap-4 pb-4 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {items.map((item: any) => (
          <TitleCard key={item.id} id={item.id} title={item.title} year={item.year || (item.release_date ? item.release_date.slice(0,4) : '?')} rating={item.rating} poster_url={item.poster_url} />
        ))}
      </div>
    </div>
  );
}
