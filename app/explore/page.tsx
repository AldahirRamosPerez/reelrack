'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TitleCard from '@/components/TitleCard';

export default function ExplorePage() {
  const [titles, setTitles] = useState([]);
  const [filters, setFilters] = useState({ title: '', media_type: '', year: '', genre: '', rating_min: '' });
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetch('/api/genres').then(res => res.json()).then(setGenres);
    loadTitles(1);
  }, []);

  async function loadTitles(page = 1) {
  setLoading(true);
  const params = new URLSearchParams({ ...filters, page: page.toString(), limit: '20' });
  try {
    const res = await fetch(`/api/titles?${params.toString()}`);
    if (!res.ok) {
      const text = await res.text();
      console.error('Error response:', text);
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    setTitles(data.data);
    setPagination({
      page: data.pagination.page,
      totalPages: data.pagination.pages,
      total: data.pagination.total,
    });
  } catch (err) {
    console.error('Error loading titles:', err);
    setTitles([]);
    setPagination({ page: 1, totalPages: 1, total: 0 });
  } finally {
    setLoading(false);
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTitles(1);
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) loadTitles(newPage);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">Explorar catálogo</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
          <input type="text" name="title" placeholder="Título" value={filters.title} onChange={handleChange} className="border rounded p-2 dark:bg-gray-700" />
          <select name="media_type" value={filters.media_type} onChange={handleChange} className="border rounded p-2 dark:bg-gray-700">
            <option value="">Todos</option>
            <option value="movie">Película</option>
            <option value="tv">Serie</option>
          </select>
          <input type="number" name="year" placeholder="Año" value={filters.year} onChange={handleChange} className="border rounded p-2 w-28 dark:bg-gray-700" />
          <select name="genre" value={filters.genre} onChange={handleChange} className="border rounded p-2 dark:bg-gray-700">
            <option value="">Género</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="number" step="0.1" name="rating_min" placeholder="Rating mínimo" value={filters.rating_min} onChange={handleChange} className="border rounded p-2 w-28 dark:bg-gray-700" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
        </form>
        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {titles.map((t: any) => (
                <TitleCard key={t.id} id={t.id} title={t.title} year={t.year} rating={t.rating} poster_url={t.poster_url} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-8">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">Página {pagination.page} de {pagination.totalPages}</span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}