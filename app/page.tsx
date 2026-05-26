import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import StatsCards from '@/components/StatsCards';
import GenreCloud from '@/components/GenreCloud';
import SectionRow from '@/components/SectionRow';

// Estadísticas (igual que antes)
async function getStats() {
  const totalRes = await query('SELECT COUNT(*) as total FROM titles');
  const avgRes = await query('SELECT AVG(rating) as avg FROM titles WHERE rating IS NOT NULL');
  const decadeRes = await query(`
    SELECT FLOOR(year/10)*10 as decade, COUNT(*) 
    FROM titles 
    WHERE year IS NOT NULL 
    GROUP BY decade 
    ORDER BY count DESC 
    LIMIT 1
  `);
  const completenessRes = await query(`
    SELECT 
      COUNT(CASE WHEN overview IS NOT NULL AND overview != '' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as overviewpct,
      COUNT(CASE WHEN poster_url IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as posterpct,
      COUNT(CASE WHEN director IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as directorpct,
      COUNT(CASE WHEN "cast" IS NOT NULL AND "cast" != '' AND "cast" != '[]' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as castpct
    FROM titles
  `);
  return {
    total: parseInt(totalRes.rows[0].total),
    avgRating: parseFloat(avgRes.rows[0].avg) || 0,
    topDecade: decadeRes.rows[0] ? `${decadeRes.rows[0].decade}s` : 'N/A',
    completeness: completenessRes.rows[0],
  };
}

// Nuevas funciones de consulta
async function getTrending(limit = 12) {
  // Películas/series con rating >= 8, ordenadas por fecha de creación (recientes)
  const res = await query(`
    SELECT id, title, year, rating, poster_url 
    FROM titles 
    WHERE rating >= 8 
    ORDER BY created_at DESC 
    LIMIT $1
  `, [limit]);
  return res.rows;
}

async function getDiscoveries(limit = 12) {
  // Títulos aleatorios con rating >= 7 (para descubrimientos)
  const res = await query(`
    SELECT id, title, year, rating, poster_url 
    FROM titles 
    WHERE rating >= 7 
    ORDER BY RANDOM() 
    LIMIT $1
  `, [limit]);
  return res.rows;
}

async function getRecentReleases(limit = 12) {
  // Últimos títulos agregados (por created_at)
  const res = await query(`
    SELECT id, title, year, rating, poster_url 
    FROM titles 
    ORDER BY created_at DESC 
    LIMIT $1
  `, [limit]);
  return res.rows;
}

async function getClassics(limit = 12) {
  // Mejor valorados de todos los tiempos (rating más alto)
  const res = await query(`
    SELECT id, title, year, rating, poster_url 
    FROM titles 
    WHERE rating IS NOT NULL 
    ORDER BY rating DESC 
    LIMIT $1
  `, [limit]);
  return res.rows;
}

export default async function Home() {
  const stats = await getStats();
  const trending = await getTrending();
  const discoveries = await getDiscoveries();
  const recentReleases = await getRecentReleases();
  const classics = await getClassics();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <Hero />
        <StatsCards stats={stats} />
        <GenreCloud />
        <SectionRow 
          title="En boca de todos" 
          icon="fa-chart-line" 
          items={trending} 
          color="text-red-500" 
        />
        <SectionRow 
          title="Joyas ocultas" 
          icon="fa-gem" 
          items={discoveries} 
          color="text-purple-500" 
        />
        <SectionRow 
          title="Recién añadidas" 
          icon="fa-clock" 
          items={recentReleases} 
          color="text-blue-500" 
        />
        <SectionRow 
          title="Legendarias" 
          icon="fa-trophy" 
          items={classics} 
          color="text-yellow-500" 
        />
      </main>
      <Footer />
    </>
  );
}