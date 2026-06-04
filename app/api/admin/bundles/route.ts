import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const slugify = (s: string) =>
  s.toLowerCase().replace(/['’"]/g, '').replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '').slice(0, 80);

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  const { data, error } = await client
    .from('bundles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bundles: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 }); }
  const title = String(b.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Потрібна назва' }, { status: 400 });
  const slug = String(b.slug ?? '').trim() || slugify(title) || `bundle-${Date.now()}`;

  const { data, error } = await client.from('bundles').insert({
    slug,
    title,
    description: b.description ? String(b.description) : null,
    emoji: String(b.emoji ?? '📦').trim() || '📦',
    product_ids: Array.isArray(b.product_ids) ? b.product_ids.map(Number) : [],
    discount_tiers: Array.isArray(b.discount_tiers) ? b.discount_tiers : [],
    published: b.published !== false,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 }); }
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.title !== undefined) patch.title = String(b.title).trim();
  if (b.slug !== undefined) patch.slug = String(b.slug).trim();
  if (b.description !== undefined) patch.description = b.description ? String(b.description) : null;
  if (b.emoji !== undefined) patch.emoji = String(b.emoji).trim() || '📦';
  if (b.product_ids !== undefined) patch.product_ids = Array.isArray(b.product_ids) ? b.product_ids.map(Number) : [];
  if (b.discount_tiers !== undefined) patch.discount_tiers = Array.isArray(b.discount_tiers) ? b.discount_tiers : [];
  if (b.published !== undefined) patch.published = !!b.published;

  const { error } = await client.from('bundles').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });
  const { error } = await client.from('bundles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
