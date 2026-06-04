import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const slugify = (s: string) =>
  s.toLowerCase().replace(/['’"]/g, '').replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '').slice(0, 90);

// GET: список товарів з фільтрами/пагінацією
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  const sp = req.nextUrl.searchParams;

  // Вибірка конкретних товарів за id (для редактора наборів)
  const ids = sp.get('ids');
  if (ids) {
    const idList = ids.split(',').map(Number).filter(Boolean);
    const { data, error } = await client
      .from('products')
      .select('id, slug, title, brand, price')
      .in('id', idList);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // зберігаємо порядок як у запиті
    const map = new Map((data ?? []).map((p) => [p.id, p]));
    const ordered = idList.map((id) => map.get(id)).filter(Boolean);
    return NextResponse.json({ products: ordered, total: ordered.length });
  }

  const type = sp.get('type') || '';
  const q = sp.get('q') || '';
  const brand = sp.get('brand') || '';
  const stock = sp.get('stock') || ''; // 'in' | 'out'
  const sort = sp.get('sort') || 'new'; // new | old | price-asc | price-desc | name
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const perPage = 30;
  const from = (page - 1) * perPage;

  let query = client
    .from('products')
    .select('id, slug, title, description, category_type, brand, price, old_price, in_stock, images, specs, is_tiktok, is_featured', { count: 'exact' })
    .range(from, from + perPage - 1);

  if (type) query = query.eq('category_type', type);
  if (q) query = query.ilike('title', `%${q}%`);
  if (brand) query = query.eq('brand', brand);
  if (stock === 'in') query = query.eq('in_stock', true);
  if (stock === 'out') query = query.eq('in_stock', false);

  if (sort === 'old') query = query.order('id', { ascending: true });
  else if (sort === 'price-asc') query = query.order('price', { ascending: true });
  else if (sort === 'price-desc') query = query.order('price', { ascending: false });
  else if (sort === 'name') query = query.order('title', { ascending: true });
  else query = query.order('id', { ascending: false }); // new

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data, total: count ?? 0, page, perPage });
}

// PATCH: оновити будь-які поля товару
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 }); }
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (b.title !== undefined) patch.title = String(b.title).trim();
  if (b.description !== undefined) patch.description = b.description ? String(b.description) : null;
  if (b.brand !== undefined) patch.brand = b.brand ? String(b.brand).trim() : null;
  if (b.price !== undefined) patch.price = b.price === null || b.price === '' ? null : Number(b.price);
  if (b.old_price !== undefined) patch.old_price = b.old_price === null || b.old_price === '' ? null : Number(b.old_price);
  if (b.in_stock !== undefined) patch.in_stock = !!b.in_stock;
  if (b.is_tiktok !== undefined) patch.is_tiktok = !!b.is_tiktok;
  if (b.is_featured !== undefined) patch.is_featured = !!b.is_featured;
  if (b.images !== undefined) patch.images = Array.isArray(b.images) ? b.images : [];
  if (b.category_type !== undefined) patch.category_type = String(b.category_type);

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Нема що оновлювати' }, { status: 400 });

  const { error } = await client.from('products').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST: створити новий товар
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 }); }
  const title = String(b.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Потрібна назва' }, { status: 400 });

  const slug = String(b.slug ?? '').trim() || slugify(title) || `product-${Date.now()}`;

  const { data, error } = await client.from('products').insert({
    slug,
    title,
    description: b.description ? String(b.description) : null,
    category_type: String(b.category_type ?? 'etransport'),
    brand: b.brand ? String(b.brand).trim() : null,
    price: b.price === null || b.price === '' || b.price === undefined ? null : Number(b.price),
    old_price: b.old_price === null || b.old_price === '' || b.old_price === undefined ? null : Number(b.old_price),
    in_stock: b.in_stock !== false,
    images: Array.isArray(b.images) ? b.images : [],
    specs: typeof b.specs === 'object' && b.specs ? b.specs : {},
    is_tiktok: !!b.is_tiktok,
    is_featured: !!b.is_featured,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

// DELETE: видалити товар
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });
  const { error } = await client.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// GET брендів для фільтра — окремий ендпоінт через ?action=brands
