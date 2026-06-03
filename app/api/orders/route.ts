import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface OrderItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  qty: number;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const { name, phone, city, note, items } = body ?? {};

  // Валідація
  if (!name?.trim() || !phone?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Заповніть ім\'я, телефон і місто' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 });
  }

  const safeItems: OrderItem[] = items
    .filter((i: any) => i && typeof i.id === 'number' && typeof i.price === 'number')
    .map((i: any) => ({
      id: i.id,
      slug: String(i.slug ?? ''),
      title: String(i.title ?? ''),
      price: Number(i.price),
      qty: Math.max(1, Number(i.qty) || 1),
    }));

  const total = safeItems.reduce((s, i) => s + i.price * i.qty, 0);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fallback без бази: лог і успіх (для роботи на демо)
  if (!url || !serviceKey) {
    console.log('[ЗАМОВЛЕННЯ — демо-режим]', { name, phone, city, note, total, items: safeItems });
    return NextResponse.json({ ok: true, demo: true });
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await db
    .from('orders')
    .insert({
      customer_name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      note: note?.trim() || null,
      items: safeItems,
      total,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не вдалося зберегти замовлення' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: data.id });
}
