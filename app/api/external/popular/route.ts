// app/api/external/popular/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const mediaType = request.nextUrl.searchParams.get('media_type') || 'movie';
  const url = `https://api.themoviedb.org/3/${mediaType}/popular`;
  const params = { api_key: process.env.TMDB_API_KEY, language: 'es-MX' };
  const response = await axios.get(url, { params });
  const simplified = response.data.results.slice(0, 10).map((item: any) => ({
    id: item.id,
    title: item.title || item.name,
    year: (item.release_date || item.first_air_date || '').slice(0, 4),
    poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
  }));
  return NextResponse.json(simplified);
}