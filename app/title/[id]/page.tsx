'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function TitleDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', year: '', rating: '' });

  useEffect(() => {
    fetch(`/api/titles/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data);
        setFormData({ title: data.title, year: data.year, rating: data.rating });
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [params.id]);

  const handleDelete = async () => {
    if (confirm('¿🗑️ Retirar de mi colección este título permanentemente?')) {
      const res = await fetch(`/api/titles/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) router.push('/');
      else alert('Error al eliminar');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/titles/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const updated = await res.json();
      setTitle(updated);
      setEditing(false);
    } else {
      alert('Error al actualizar');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-1/3 p-4 flex justify-center">
              {title.poster_url ? (
                <Image src={title.poster_url} alt={title.title} width={300} height={450} className="rounded-xl shadow" />
              ) : (
                <div className="w-64 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <i className="fas fa-image text-4xl text-gray-400"></i>
                </div>
              )}
            </div>
            <div className="p-6 md:w-2/3">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div><label className="block font-semibold">Título</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border rounded w-full p-2 dark:bg-gray-700" /></div>
                  <div><label className="block font-semibold">Año</label><input type="text" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="border rounded w-full p-2 dark:bg-gray-700" /></div>
                  <div><label className="block font-semibold">Rating</label><input type="text" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="border rounded w-full p-2 dark:bg-gray-700" /></div>
                  <div className="flex gap-3"><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button><button type="button" onClick={() => setEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button></div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{title.title}</h1>
                  <p className="text-gray-500 dark:text-gray-400 italic">{title.original_title}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{title.year}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{title.media_type}</span>
                    <span className="text-yellow-500">⭐ {title.rating}</span>
                  </div>
                  {title.overview && <p className="mt-4 text-gray-700 dark:text-gray-300">{title.overview}</p>}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    {title.director && <div><i className="fas fa-user-tie"></i> Director: {title.director}</div>}
                    {title.cast && <div><i className="fas fa-users"></i> Reparto: {title.cast}</div>}
                    {title.runtime && <div><i className="fas fa-hourglass-half"></i> Duración: {title.runtime} min</div>}
                  </div>
                  {token && (
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded">✏️ Corregir ficha</button>
                      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">🗑️ Retirar de mi colección</button>
                    </div>
                  )}
                  <a href="/" className="inline-block mt-4 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">← Seguir descubriendo</a>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}