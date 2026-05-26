// app/add/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AddPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ title: '', media_type: 'movie', year: '', external_id: '' });
  const [error, setError] = useState<string | React.ReactNode>(null);
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  if (!token) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">Acceso denegado. Solo administradores.</div>
        </main>
        <Footer />
      </>
    );
  }

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    const res = await fetch(`/api/external/search?query=${encodeURIComponent(searchQuery)}&media_type=${searchType}`);
    const data = await res.json();
    setResults(data);
  };

  const selectResult = (item: any) => {
    setForm({ title: item.title, media_type: searchType, year: item.year, external_id: item.external_id });
    setResults([]);
    setSearchQuery('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${token}` },
        body: new URLSearchParams(form as any).toString(),
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(
          <>
            {data.error}.{' '}
            <a href={`/title/${data.duplicateId}`} className="text-blue-600 underline">
              Ver título existente
            </a>
          </>
        );
      } else if (res.redirected) {
        router.push(res.url);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar el título');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleAutoUpdate = async () => {
    if (!confirm('¿Deseas buscar y añadir automáticamente las últimas películas, series y anime estrenados en el último mes? Puede tomar unos segundos.')) return;
    setUpdating(true);
    setUpdateResult(null);
    try {
      const res = await fetch('/api/admin/update-catalog', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateResult(`✅ Actualización completada: ${data.addedCount} nuevos títulos agregados, ${data.duplicateCount} duplicados.`);
        if (data.addedTitles.length) {
          setUpdateResult(prev => prev + ` Ejemplos: ${data.addedTitles.slice(0, 5).join(', ')}...`);
        }
      } else {
        setUpdateResult(`❌ Error: ${data.error || 'No se pudo completar la actualización'}`);
      }
    } catch (err) {
      setUpdateResult('❌ Error de conexión al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Sumar una obra a tu repertorio</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Búsqueda en TMDb</label>
            <div className="flex gap-2">
              <select value={searchType} onChange={e => setSearchType(e.target.value)} className="border rounded p-2 dark:bg-gray-700">
                <option value="movie">Película</option>
                <option value="tv">Serie</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ej: Inception"
                className="flex-1 border rounded p-2 dark:bg-gray-700"
              />
              <button onClick={handleSearch} className="bg-blue-600 text-white px-3 py-2 rounded">
                Localizar en TMDb
              </button>
            </div>
            {results.length > 0 && (
              <div className="mt-2 border rounded divide-y">
                {results.map((r: any) => (
                  <div key={r.external_id} className="p-2 flex justify-between items-center">
                    <span><strong>{r.title}</strong> ({r.year})</span>
                    <button onClick={() => selectResult(r)} className="bg-green-600 text-white text-xs px-2 py-1 rounded">Usar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div><label className="block mt-2">Título *</label><input type="text" name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full border rounded p-2 dark:bg-gray-700" /></div>
            <div><label className="block mt-2">Tipo *</label><select name="media_type" value={form.media_type} onChange={e => setForm({ ...form, media_type: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700"><option value="movie">Película</option><option value="tv">Serie</option></select></div>
            <div><label className="block mt-2">Año *</label><input type="number" name="year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required className="w-full border rounded p-2 dark:bg-gray-700" /></div>
            <div><label className="block mt-2">ID externo (opcional)</label><input type="text" name="external_id" value={form.external_id} onChange={e => setForm({ ...form, external_id: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-700" placeholder="tmdb:12345" /></div>
            <button type="submit" disabled={updating} className="w-full mt-4 bg-green-600 text-white py-2 rounded disabled:opacity-50">Añadir a ReelRack</button>
          </form>

          <hr className="my-6 border-gray-300 dark:border-gray-700" />

          <div>
            <button
              onClick={handleAutoUpdate}
              disabled={updating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando catálogo...
                </>
              ) : (
                'Actualizar catálogo automático (últimos estrenos)'
              )}
            </button>
            {updateResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${updateResult.startsWith('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                {updateResult}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}