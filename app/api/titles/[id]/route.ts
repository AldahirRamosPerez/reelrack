import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await query('SELECT * FROM titles WHERE id = $1', [params.id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = params;
  const fields = Object.keys(body);
  if (fields.length === 0) return NextResponse.json({ error: 'No hay campos' }, { status: 400 });

  const setClause = fields.map((field, idx) => {
    const colName = field === 'cast' ? '"cast"' : field;
    return `${colName} = $${idx + 1}`;
  }).join(', ');
  const values = fields.map(f => body[f]);
  values.push(id);
  const sql = `UPDATE titles SET ${setClause} WHERE id = $${values.length}`;
  await query(sql, values);
  const updated = await query('SELECT * FROM titles WHERE id = $1', [id]);
  return NextResponse.json(updated.rows[0]);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = params;
  const result = await query('DELETE FROM titles WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Eliminado correctamente', id: result.rows[0].id });
}