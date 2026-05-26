import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string, mediaType: 'movie' | 'tv' = 'movie') {
  const url = `${BASE_URL}/search/${mediaType}`;
  const params = { api_key: TMDB_API_KEY, query, language: 'es-MX' };
  const response = await axios.get(url, { params });
  return response.data.results.slice(0, 10).map((item: any) => ({
    external_id: `tmdb:${item.id}`,
    title: item.title || item.name,
    year: (item.release_date || item.first_air_date || '').slice(0, 4),
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
  }));
}

export async function getUpcomingMovies(page = 1) {
  const url = `${BASE_URL}/movie/upcoming`;
  const params = { api_key: TMDB_API_KEY, language: 'es-MX', page };
  const response = await axios.get(url, { params });
  return response.data.results.map((movie: any) => ({
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date,
    poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    overview: movie.overview,
  }));
}

export async function fetchMovieDetails(tmdbId: string, mediaType: 'movie' | 'tv') {
  const url = `${BASE_URL}/${mediaType}/${tmdbId}`;
  const params = { api_key: TMDB_API_KEY, language: 'es-MX', append_to_response: 'credits' };
  const response = await axios.get(url, { params });
  const data = response.data;
  const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null;
  const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(', ') || null;
  return {
    title: data.title || data.name,
    original_title: data.original_title || data.original_name,
    year: (data.release_date || data.first_air_date || '').slice(0, 4),
    rating: data.vote_average,
    genres: data.genres?.map((g: any) => g.name).join('|'),
    overview: data.overview,
    poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
    budget: data.budget,
    revenue: data.revenue,
    director,
    cast,
  };
}
