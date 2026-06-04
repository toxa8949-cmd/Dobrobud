import { supabase } from './supabase';
import type { Product } from './supabase';

export type DiscountTier = {
  min: number; // мінімальна кількість товарів
  type: 'percent' | 'amount';
  value: number;
};

export type Bundle = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  emoji: string;
  product_ids: number[];
  discount_tiers: DiscountTier[];
  published: boolean;
};

export type BundleWithProducts = Bundle & { products: Product[] };

// Підбирає рівень знижки за кількістю обраних товарів.
// Повертає найвигідніший рівень, для якого виконано min.
export function pickTier(tiers: DiscountTier[], count: number): DiscountTier | null {
  const eligible = (tiers ?? [])
    .filter((t) => count >= t.min)
    .sort((a, b) => b.min - a.min);
  return eligible[0] ?? null;
}

// Рахує підсумок: сума без знижки, знижка, фінал.
export function calcBundle(
  prices: number[],
  tiers: DiscountTier[]
): { subtotal: number; discount: number; total: number; tier: DiscountTier | null } {
  const subtotal = prices.reduce((s, p) => s + p, 0);
  const tier = pickTier(tiers, prices.length);
  let discount = 0;
  if (tier) {
    discount = tier.type === 'percent'
      ? Math.round((subtotal * tier.value) / 100)
      : Math.min(tier.value, subtotal);
  }
  return { subtotal, discount, total: subtotal - discount, tier };
}

// Наступний рівень (для підказки "додай ще N → знижка зросте")
export function nextTier(tiers: DiscountTier[], count: number): DiscountTier | null {
  const above = (tiers ?? [])
    .filter((t) => t.min > count)
    .sort((a, b) => a.min - b.min);
  return above[0] ?? null;
}

export async function getBundles(): Promise<Bundle[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Bundle[];
  } catch {
    return [];
  }
}

export async function getBundleBySlug(slug: string): Promise<BundleWithProducts | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    if (error || !data) return null;
    const bundle = data as Bundle;

    let products: Product[] = [];
    if (bundle.product_ids?.length) {
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .in('id', bundle.product_ids);
      // зберігаємо порядок як у product_ids
      const map = new Map((prods ?? []).map((p) => [p.id, p as Product]));
      products = bundle.product_ids.map((id) => map.get(id)).filter(Boolean) as Product[];
    }
    return { ...bundle, products };
  } catch {
    return null;
  }
}
