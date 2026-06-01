import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';


const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables');
}

const BASE_URL = 'https://api.themoviedb.org/3';

function getDate(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

async function fetchFromTMDB(endpoint: string, params: Record<string, any> = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const allParams: Record<string, string> = {
    api_key: TMDB_API_KEY!,
    language: 'es-MX',
    ...params,
  };
  
  // Convertir los parámetros a string de consulta manualmente
  const queryString = Object.entries(allParams)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  try {
    const response = await fetch(`${url}?${queryString}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}


export async function POST(request: NextRequest) {
  // Verificar autenticación...
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

    // Obtener datos de diferentes endpoints...
    const [newMovies, newShows, onTheAir, trending, animeMovies, animeShows] = await Promise.all([
      fetchFromTMDB('/discover/movie', { 'primary_release_date.gte': oneMonthAgo, 'primary_release_date.lte': today, sort_by: 'primary_release_date.desc', include_adult: false }),
      fetchFromTMDB('/discover/tv', { 'first_air_date.gte': oneMonthAgo, 'first_air_date.lte': today, sort_by: 'first_air_date.desc' }),
      fetchFromTMDB('/tv/on_the_air'),
      fetchFromTMDB('/trending/all/week'),
      fetchFromTMDB('/discover/movie', { with_keywords: '210024' }),
      fetchFromTMDB('/discover/tv', { with_keywords: '210024' })
    ]);

    const allItems = [...newMovies, ...newShows, ...onTheAir, ...trending, ...animeMovies, ...animeShows];
    const uniqueMap = new Map();
    for (const item of allItems) {
      const externalId = `tmdb:${item.id}`;
      if (!uniqueMap.has(externalId)) {
        uniqueMap.set(externalId, item);
      }
    }

    // Insertar en base de datos - VERSIÓN CORREGIDA
    const itemsArray = Array.from(uniqueMap.values());
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      const title = item.title || item.name;
      const mediaType = item.media_type === 'movie' || (item.title && !item.name) ? 'movie' : 'tv';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const externalId = `tmdb:${item.id}`;
      const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
      const overview = item.overview || '';
      const rating = item.vote_average;

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
    return NextResponse.json({ success: true, addedCount, duplicateCount, addedTitles: addedTitles.slice(0, 20) });
  } catch (error) {
    console.error('Error en actualización automática:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}