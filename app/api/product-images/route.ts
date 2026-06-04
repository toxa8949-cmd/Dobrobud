import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/product-images?slugs=slug1,slug2 → { images: { slug: url } }
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get('slugs') || '';
  const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (!supabase || slugs.length === 0) return NextResponse.json({ images: {} });

  try {
    const { data, error } = await supabase
      .from('products')
      .select('slug, images')
      .in('slug', slugs);
    if (error || !data) return NextResponse.json({ images: {} });

    const images: Record<string, string> = {};
    for (const row of data as { slug: string; images: string[] }[]) {
      if (row.images?.[0]) images[row.slug] = row.images[0];
    }
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: {} });
  }
}
