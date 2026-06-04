import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: унікальні бренди (опційно за типом)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  const type = req.nextUrl.searchParams.get('type') || '';
  let q = client.from('products').select('brand, specs').not('brand', 'is', null);
  if (type) q = q.eq('category_type', type);

  const { data, error } = await q.limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const brands = Array.from(new Set((data ?? []).map((r) => r.brand).filter(Boolean)))
    .sort((a, b) => String(a).localeCompare(String(b), 'uk'));

  // Унікальні підкатегорії зі specs
  const subcats = Array.from(
    new Set(
      (data ?? [])
        .map((r: any) => r.specs?.subcategory)
        .filter((s: any) => s && typeof s === 'string')
    )
  ).sort((a, b) => String(a).localeCompare(String(b), 'uk'));

  return NextResponse.json({ brands, subcats });
}
