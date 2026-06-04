import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, adminDb, unauthorized, noDb } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const client = adminDb();
  if (!client) return noDb();

  // Рахуємо паралельно
  const [
    productsTotal,
    ordersTotal,
    newOrders,
    noPhoto,
    noDesc,
    recentOrdersRes,
    allOrdersRes,
  ] = await Promise.all([
    client.from('products').select('id', { count: 'exact', head: true }),
    client.from('orders').select('id', { count: 'exact', head: true }),
    client.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    client.from('products').select('id', { count: 'exact', head: true }).eq('has_photo', false),
    client.from('products').select('id', { count: 'exact', head: true }).or('description.is.null,description.eq.'),
    client.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
    client.from('orders').select('total,status'),
  ]);

  // Сума продажів (без скасованих)
  let revenue = 0;
  let doneCount = 0;
  for (const o of allOrdersRes.data ?? []) {
    if (o.status !== 'cancelled') {
      revenue += Number(o.total) || 0;
      if (o.status === 'done') doneCount++;
    }
  }

  return NextResponse.json({
    products: productsTotal.count ?? 0,
    orders: ordersTotal.count ?? 0,
    newOrders: newOrders.count ?? 0,
    noPhoto: noPhoto.count ?? 0,
    noDesc: noDesc.count ?? 0,
    revenue,
    doneCount,
    recentOrders: recentOrdersRes.data ?? [],
  });
}
