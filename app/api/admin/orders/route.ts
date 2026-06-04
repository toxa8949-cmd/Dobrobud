import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: список замовлень (з фільтром за статусом)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const perPage = 30;
  const from = (page - 1) * perPage;

  let q = client
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (status) q = q.eq('status', status);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [], total: count ?? 0 });
}

// PATCH: змінити статус замовлення
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  let body: { id?: number; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const { id, status } = body;
  const allowed = ['new', 'processing', 'shipped', 'done', 'cancelled'];
  if (!id || !status || !allowed.includes(status)) {
    return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });
  }

  const { error } = await client.from('orders').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
