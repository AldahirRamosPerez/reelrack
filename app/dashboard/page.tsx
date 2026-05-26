'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WorldMap from '@/components/WorldMap';

// Interfaces para tipado
interface TypeCount {
  type: string;
  count: number;
}
interface RatingYear {
  year: number;
  avg: number;
}
interface Genre {
  name: string;
  count: number;
}
interface Decade {
  decade: number;
  count: number;
}
interface Country {
  country: string;
  count: number;
}
interface DashboardData {
  total: number;
  avgRating: number;
  typeCounts: TypeCount[];
  ratingOverYears: RatingYear[];
  topGenres: Genre[];
  decadeDistribution: Decade[];
  topCountries: Country[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    total: 0,
    avgRating: 0,
    typeCounts: [],
    ratingOverYears: [],
    topGenres: [],
    decadeDistribution: [],
    topCountries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeFetch = async (url: string, fallback: any = []) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        return await res.json();
      } catch {
        return fallback;
      }
    };

    async function fetchAll() {
      const [stats, genres, decades, countries] = await Promise.all([
        safeFetch('/api/stats', { total: 0, avgRating: 0, typeCounts: [], ratingOverYears: [] }),
        safeFetch('/api/stats/genres', []),
        safeFetch('/api/stats/decades', []),
        safeFetch('/api/stats/top-countries', [])
      ]);

      // Limpiar typeCounts (opcional, ya no se usa pero se mantiene por si acaso)
      const cleanedTypeCounts = (stats.typeCounts || []).filter(
        (t: any) => t.type && t.type.trim() !== ''
      );

      setData({
        total: stats.total || 0,
        avgRating: stats.avgRating || 0,
        typeCounts: cleanedTypeCounts,
        ratingOverYears: stats.ratingOverYears || [],
        topGenres: genres,
        decadeDistribution: decades,
        topCountries: countries
      });
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-6 py-8 text-center">Cargando estadísticas...</main>
        <Footer />
      </>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Estudio de colección</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold">{data.total}</p>
            <p className="text-sm text-gray-500">Obras maestras</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold">{data.avgRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Valoración media</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold">{data.decadeDistribution[0]?.decade || 0}s</p>
            <p className="text-sm text-gray-500">Década favorita</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold">{data.topGenres[0]?.count || 0}</p>
            <p className="text-sm text-gray-500">Género predominante</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolución del rating por año */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Tus gustos a lo largo del tiempo</h2>
            {data.ratingOverYears.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.ratingOverYears}>
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay suficientes datos para mostrar la evolución.
              </div>
            )}
          </div>

          {/* Gráfico de barras: géneros más frecuentes */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Géneros que te definen</h2>
            {data.topGenres.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart layout="vertical" data={data.topGenres} margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No hay datos de géneros.
              </div>
            )}
          </div>
        </div>

        {/* Mapa de países (solo si hay datos) */}
        {data.topCountries.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-3">Países con más producciones</h2>
            <WorldMap data={data.topCountries} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}