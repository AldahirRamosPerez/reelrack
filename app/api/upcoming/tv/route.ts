// app/api/upcoming/tv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const url = 'https://api.themoviedb.org/3/tv/on_the_air';
  const params = {
    api_key: process.env.TMDB_API_KEY,
    language: 'es-MX',
    page,
  };
  try {
    const response = await axios.get(url, { params });
    const results = response.data.results.map((series: any) => ({
      id: series.id,
      title: series.name,
      release_date: series.first_air_date,
      poster_url: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : null,
      overview: series.overview,
    }));
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching on air TV' }, { status: 500 });
  }
}
