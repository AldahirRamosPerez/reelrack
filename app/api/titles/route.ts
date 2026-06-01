import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { GENRE_MAPPING } from '@/lib/genreMapping';
import { verifyAdminToken } from '@/lib/auth';

// Helper para escapar nombres de columnas reservados
function escapeColumn(col: string): string {
  if (col === 'cast') return '"cast"';
  return col;
}

// ==================== GET ====================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;
    const title = searchParams.get('title');
    const media_type = searchParams.get('media_type');
    const year = searchParams.get('year');
    const genreParam = searchParams.get('genre');
    const rating_min = searchParams.get('rating_min');

    let sql = 'SELECT * FROM titles WHERE 1=1';
    const params: any[] = [];

    const addCondition = (condition: string, value: any) => {
      params.push(value);
      sql += ` ${condition} $${params.length}`;
    };

    if (title && title.trim() !== '') addCondition('AND title ILIKE', `%${title.trim()}%`);
    if (media_type && media_type !== 'todos' && media_type !== '') {
      let dbType = media_type === 'movie' ? 'Película' : media_type === 'tv' ? 'Serie' : media_type;
      addCondition('AND media_type =', dbType);
    }
    if (year && !isNaN(parseInt(year))) addCondition('AND year =', parseInt(year));
    if (rating_min && !isNaN(parseFloat(rating_min))) addCondition('AND rating >=', parseFloat(rating_min));

    if (genreParam && genreParam !== '') {
      if (genreParam === 'Novelas') {
        const fuentesRes = await query(`
          SELECT DISTINCT fuente FROM titles WHERE categoria ILIKE '%Novelas%' AND fuente IS NOT NULL
        `);
        const fuentes = fuentesRes.rows.map((row: any) => row.fuente);
        if (fuentes.length > 0) {
          const placeholders = fuentes.map((_, i) => `$${params.length + i + 1}`).join(',');
          sql += ` AND fuente IN (${placeholders})`;
          params.push(...fuentes);
        } else {
          sql += ` AND 1=0`;
        }
      } else {
        const keywords = GENRE_MAPPING[genreParam];
        if (keywords && keywords.length > 0) {
          let idx = params.length + 1;
          const conditions = keywords.map(() => `genres ILIKE ?`).join(' OR ').replace(/\?/g, () => `$${idx++}`);
          sql += ` AND (${conditions})`;
          keywords.forEach(kw => params.push(`%${kw}%`));
        } else {
          addCondition('AND genres ILIKE', `%${genreParam}%`);
        }
      }
    }

    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as sub`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total);

    const isRandom = searchParams.get('random') === 'true';
    if (isRandom) {
      sql += ` ORDER BY RANDOM()`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await query(sql, params);

    return NextResponse.json({
      data: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/titles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ==================== POST ====================
export async function POST(request: NextRequest) {
  // 1. Autenticación
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // 2. Obtener datos del formulario
  const formData = await request.formData();
  let title = formData.get('title') as string;
  let media_type = formData.get('media_type') as string;
  let year = parseInt(formData.get('year') as string);
  let external_id = formData.get('external_id') as string | null;

  // 3. Si se proporciona external_id (tmdb:xxx), enriquecer con datos de TMDb
  let enriched = null;
  if (external_id && external_id.startsWith('tmdb:')) {
    const tmdbId = external_id.split(':')[1];
    try {
      const { fetchMovieDetails } = await import('@/lib/tmdb');
      enriched = await fetchMovieDetails(tmdbId, media_type as 'movie' | 'tv');
    } catch (err) {
      console.error('Error fetching TMDb details:', err);
      // Continuamos sin enriquecer
    }
  }

  // 4. Construir el objeto newTitle (sin incluir 'id')
  let newTitle: any;
  if (enriched) {
    newTitle = {
      title: enriched.title,
      original_title: enriched.original_title,
      media_type,
      year: enriched.year ? parseInt(enriched.year) : year,
      rating: enriched.rating,
      genres: enriched.genres,
      overview: enriched.overview,
      poster_url: enriched.poster_url,
      budget: enriched.budget,
      revenue: enriched.revenue,
      director: enriched.director,
      cast: enriched.cast,
      external_id,
    };
  } else {
    newTitle = {
      title,
      media_type,
      year,
      external_id,
    };
  }

  // Eliminar cualquier propiedad 'id' que pudiera haber venido accidentalmente
  delete newTitle.id;

  // 5. Verificar duplicados
  const existing = await query(
    `SELECT id, title FROM titles 
     WHERE (title = $1 AND year = $2 AND media_type = $3) OR (external_id IS NOT NULL AND external_id = $4)`,
    [newTitle.title, newTitle.year, newTitle.media_type, newTitle.external_id]
  );
  if (existing.rows.length > 0) {
    return NextResponse.json(
      {
        error: 'Este título ya existe en tu catálogo',
        duplicateId: existing.rows[0].id,
        duplicateTitle: existing.rows[0].title,
      },
      { status: 409 }
    );
  }

  // 6. Insertar nuevo título
  const columns = Object.keys(newTitle).map(escapeColumn).join(', ');
  const placeholders = Object.keys(newTitle).map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(newTitle);
  const result = await query(
    `INSERT INTO titles (${columns}) VALUES (${placeholders}) RETURNING id`,
    values
  );
  const id = result.rows[0].id;

  // 7. Redirigir a la página de detalle
  return NextResponse.redirect(new URL(`/title/${id}`, request.url), 303);
}