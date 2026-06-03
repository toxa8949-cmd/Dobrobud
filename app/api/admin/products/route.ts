import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function checkAuth(req: NextRequest): boolean {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return true;
  return req.headers.get('x-admin-password') === pass;
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET: список товарів з пагінацією/фільтром
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Доступ заборонено' }, { status: 401 });
  const client = db();
  if (!client) return NextResponse.json({ error: 'База не налаштована' }, { status: 500 });

  const sp = req.nextUrl.searchParams;
  const type = sp.get('type') || '';
  const q = sp.get('q') || '';
  const onlyEmpty = sp.get('onlyEmpty') === '1';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const perPage = 50;
  const from = (page - 1) * perPage;

  let query = client
    .from('products')
    .select('id, slug, title, description, category_type, brand, price, specs', { count: 'exact' })
    .order('id', { ascending: true })
    .range(from, from + perPage - 1);

  if (type) query = query.eq('category_type', type);
  if (q) query = query.ilike('title', `%${q}%`);
  if (onlyEmpty) query = query.or('description.is.null,description.eq.');

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data, total: count ?? 0, page, perPage });
}

// PATCH: зберегти опис товару
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Доступ заборонено' }, { status: 401 });
  const client = db();
  if (!client) return NextResponse.json({ error: 'База не налаштована' }, { status: 500 });

  let body: { id?: number; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: 'Потрібен id' }, { status: 400 });

  const { error } = await client
    .from('products')
    .update({ description: body.description ?? null })
    .eq('id', body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
