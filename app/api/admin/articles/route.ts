import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// GET: усі статті (для адмінки)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  const { data, error } = await client
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data ?? [] });
}

// POST: створити статтю
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const title = String(b.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Потрібен заголовок' }, { status: 400 });

  const slug = String(b.slug ?? '').trim() || slugify(title) || `article-${Date.now()}`;

  const { data, error } = await client
    .from('articles')
    .insert({
      slug,
      title,
      excerpt: String(b.excerpt ?? '').trim() || null,
      emoji: String(b.emoji ?? '📝').trim() || '📝',
      body: String(b.body ?? ''),
      published: b.published !== false,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

// PATCH: оновити статтю
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.title !== undefined) patch.title = String(b.title).trim();
  if (b.slug !== undefined) patch.slug = String(b.slug).trim();
  if (b.excerpt !== undefined) patch.excerpt = String(b.excerpt).trim() || null;
  if (b.emoji !== undefined) patch.emoji = String(b.emoji).trim() || '📝';
  if (b.body !== undefined) patch.body = String(b.body);
  if (b.published !== undefined) patch.published = !!b.published;

  const { error } = await client.from('articles').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE: видалити статтю
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });

  const { error } = await client.from('articles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
