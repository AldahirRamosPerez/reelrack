import Image from 'next/image';
import Link from 'next/link';

interface TitleCardProps {
  id: number;
  title: string;
  year: number | string;
  rating?: number;
  poster_url?: string | null;
}

export default function TitleCard({ id, title, year, rating, poster_url }: TitleCardProps) {
  return (
    <Link href={`/title/${id}`} className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition group">
      <div className="aspect-[2/3] overflow-hidden relative">
        {poster_url ? (
          <Image src={poster_url} alt={title} fill className="object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400">
            <i className="fas fa-image text-3xl"></i>
          </div>
        )}
      </div>
      <div className="p-2 text-center">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{year} {rating && <span className="text-yellow-500">⭐ {rating}</span>}</p>
      </div>
    </Link>
  );
}
