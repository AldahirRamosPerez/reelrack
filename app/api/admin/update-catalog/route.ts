import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function getDate(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

async function fetchFromTMDB(endpoint: string, params: Record<string, any> = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const allParams = { api_key: TMDB_API_KEY, language: 'es-MX', ...params };
  try {
    const response = await fetch(url + '?' + new URLSearchParams(allParams));
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  console.log('🚀 Iniciando actualización automática del catálogo...');
  let addedCount = 0;
  let duplicateCount = 0;
  const addedTitles: string[] = [];

  try {
    const oneMonthAgo = getDate(30);
    const today = getDate(0);

    // 1. Películas estrenadas en el último mes
    const newMovies = await fetchFromTMDB('/discover/movie', {
      'primary_release_date.gte': oneMonthAgo,
      'primary_release_date.lte': today,
      sort_by: 'primary_release_date.desc',
      include_adult: false,
    });

    // 2. Series estrenadas en el último mes
    const newShows = await fetchFromTMDB('/discover/tv', {
      'first_air_date.gte': oneMonthAgo,
      'first_air_date.lte': today,
      sort_by: 'first_air_date.desc',
    });

    // 3. Series que se emiten actualmente (próximos 7 días)
    const onTheAir = await fetchFromTMDB('/tv/on_the_air');

    // 4. Tendencias de la semana (películas + series)
    const trending = await fetchFromTMDB('/trending/all/week');

    // 5. Anime (keyword id 210024)
    const animeMovies = await fetchFromTMDB('/discover/movie', { with_keywords: '210024' });
    const animeShows = await fetchFromTMDB('/discover/tv', { with_keywords: '210024' });

    // Combinar y eliminar duplicados por external_id
    const allItems = [...newMovies, ...newShows, ...onTheAir, ...trending, ...animeMovies, ...animeShows];
    const uniqueMap = new Map();
    for (const item of allItems) {
      const externalId = `tmdb:${item.id}`;
      if (!uniqueMap.has(externalId)) {
        uniqueMap.set(externalId, item);
      }
    }

    // Insertar en base de datos
    for (const item of uniqueMap.values()) {
      const title = item.title || item.name;
      const mediaType = item.media_type === 'movie' || (item.title && !item.name) ? 'movie' : 'tv';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const externalId = `tmdb:${item.id}`;
      const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
      const overview = item.overview || '';
      const rating = item.vote_average;

      // Verificar si ya existe por external_id
      const existing = await query('SELECT id FROM titles WHERE external_id = $1', [externalId]);
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO titles (title, media_type, year, external_id, poster_url, overview, rating, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [title, mediaType, year, externalId, posterUrl, overview, rating]
        );
        addedCount++;
        addedTitles.push(`${title} (${year})`);
      } else {
        duplicateCount++;
      }
    }

    console.log(`✅ Actualización completada. Agregados: ${addedCount}, Duplicados: ${duplicateCount}`);

    return NextResponse.json({
      success: true,
      addedCount,
      duplicateCount,
      addedTitles: addedTitles.slice(0, 20), // solo primeros 20 para no saturar
    });
  } catch (error) {
    console.error('Error en actualización automática:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}