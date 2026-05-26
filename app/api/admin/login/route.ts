import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === ADMIN_PASSWORD) {
    const token = generateAdminToken();
    return NextResponse.json({ token });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}