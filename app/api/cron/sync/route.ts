import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseFeed } from '@/lib/feeds/parser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Запис у БД через service_role (повний доступ, в обхід RLS)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(req: Request) {
  // Захист: Vercel Cron шле заголовок з CRON_SECRET
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = adminClient();
  const { data: sources } = await db.from('feed_sources').select('*').eq('is_active', true);

  const results: Record<string, any> = {};

  for (const src of sources ?? []) {
    try {
      const res = await fetch(src.url, { signal: AbortSignal.timeout(30000) });
      const xml = await res.text();
      const products = parseFeed(xml, src.mapping_key);

      // Upsert по (source_id, external_id)
      const rows = products.map((p) => ({
        external_id: p.externalId,
        source_id: src.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category_type: p.categoryType,
        brand: p.brand,
        price: p.price,
        old_price: p.oldPrice,
        in_stock: p.inStock,
        images: p.images,
        specs: p.specs,
      }));

      const { error } = await db.from('products').upsert(rows, {
        onConflict: 'source_id,external_id',
      });
      if (error) throw error;

      await db
        .from('feed_sources')
        .update({ last_sync_at: new Date().toISOString(), last_status: `ok: ${rows.length}` })
        .eq('id', src.id);

      results[src.name] = { synced: rows.length };
    } catch (e: any) {
      await db
        .from('feed_sources')
        .update({ last_sync_at: new Date().toISOString(), last_status: `error: ${e.message}` })
        .eq('id', src.id);
      results[src.name] = { error: e.message };
    }
  }

  return NextResponse.json({ ok: true, results });
}
