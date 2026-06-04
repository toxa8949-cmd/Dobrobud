import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TRANSLIT: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',
  ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia',
};
const slugify = (s: string) =>
  s.toLowerCase()
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

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
    image: b.image ? String(b.image).trim() : null,
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
  if (b.image !== undefined) patch.image = b.image ? String(b.image).trim() : null;
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
