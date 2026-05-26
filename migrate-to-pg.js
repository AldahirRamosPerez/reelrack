const fs = require('fs').promises;
const path = require('path');
const { query } = require('./database/pgClient');
require('dotenv').config();

function cleanValue(value) {
  // Convierte valores vacíos o nulos a null, excepto para título donde necesitamos un valor
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

async function migrate() {
  console.log('📦 Iniciando migración de datos...');
  try {
    const dataPath = path.join(__dirname, 'db.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const { titles } = JSON.parse(fileContent);
    if (!titles || titles.length === 0) {
      console.log('⚠️ No se encontraron títulos en db.json.');
      return;
    }
    console.log(`📄 Se encontraron ${titles.length} títulos para migrar.`);

    // Insert con 35 placeholders (ahora coincide)
    const insertQuery = `
      INSERT INTO titles (
        id, title, original_title, media_type, year, categoria,
        rating, rating_imdb, rating_anime, votes_imdb, genres,
        overview, poster_path, poster_url, director, "cast",
        budget, revenue, runtime, production_companies, production_countries,
        tagline, adult, episodes, studio, number_of_seasons,
        number_of_episodes, popularidad, idioma, fuente, ruta,
        status, vote_count, external_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35
      )
      ON CONFLICT (external_id) DO NOTHING;
    `;

    let insertedCount = 0;
    let skippedCount = 0;

    for (const t of titles) {
      // Validar que el título no sea nulo ni vacío
      let titleValue = cleanValue(t.title);
      if (!titleValue) {
        console.log(`⚠️ Saltando título con ID ${t.id} porque no tiene título válido.`);
        skippedCount++;
        continue;
      }

      const createdAt = t.created_at ? new Date(t.created_at) : null;
      const values = [
        t.id, titleValue,
        cleanValue(t.original_title),
        cleanValue(t.media_type),
        cleanValue(t.year),
        cleanValue(t.categoria),
        cleanValue(t.rating),
        cleanValue(t.rating_imdb),
        cleanValue(t.rating_anime),
        cleanValue(t.votes_imdb),
        cleanValue(t.genres),
        cleanValue(t.overview),
        cleanValue(t.poster_path),
        cleanValue(t.poster_url),
        cleanValue(t.director),
        cleanValue(t.cast),
        cleanValue(t.budget),
        cleanValue(t.revenue),
        cleanValue(t.runtime),
        cleanValue(t.production_companies),
        cleanValue(t.production_countries),
        cleanValue(t.tagline),
        cleanValue(t.adult),
        cleanValue(t.episodes),
        cleanValue(t.studio),
        cleanValue(t.number_of_seasons),
        cleanValue(t.number_of_episodes),
        cleanValue(t.popularidad),
        cleanValue(t.idioma),
        cleanValue(t.fuente),
        cleanValue(t.ruta),
        cleanValue(t.status),
        cleanValue(t.vote_count),
        cleanValue(t.external_id),
        createdAt
      ];

      try {
        await query(insertQuery, values);
        insertedCount++;
        if (insertedCount % 500 === 0) console.log(`   ... ${insertedCount} títulos migrados`);
      } catch (err) {
        console.error(`❌ Error al migrar el título con ID ${t.id}: ${err.message}`);
        // Si el error es por título nulo (aunque ya lo filtramos, por si acaso)
        if (err.message.includes('title')) {
          console.log(`   -> Título problemático: ${t.title}`);
        }
      }
    }
    console.log(`✅ Migración completada. Se migraron ${insertedCount} títulos. Saltados: ${skippedCount}`);
  } catch (err) {
    console.error('❌ Error crítico:', err);
  } finally {
    const { close } = require('./database/pgClient');
    await close();
  }
}

migrate();