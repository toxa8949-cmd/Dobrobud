import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Клієнт для читання (публічний). Запис — окремий service_role клієнт у cron.
export const supabase =
  url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null;

export type CategoryType = 'etransport' | 'chemistry' | 'tools';

export interface Product {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category_type: CategoryType;
  brand?: string | null;
  price: number | null;
  old_price?: number | null;
  in_stock: boolean;
  images: string[];
  specs: Record<string, any>;
  is_featured?: boolean;
}

// ── Тестові дані: працюють поки не підключені реальні фіди ──
export const DEMO_PRODUCTS: Product[] = [
  { id: 1, slug: 'kukirin-g2-max', title: 'Електросамокат KUKIRIN G2 Max', category_type: 'etransport', brand: 'KUKIRIN', price: 22999, old_price: 26999, in_stock: true, images: [], is_featured: true, specs: { speed_kmh: 45, range_km: 50, power_w: 800, battery: '48V 15Ah' } },
  { id: 2, slug: 'elektrovelosiped-275', title: 'Електровелосипед 27.5" City', category_type: 'etransport', brand: 'Ardis', price: 31500, in_stock: true, images: [], is_featured: true, specs: { speed_kmh: 25, range_km: 60, power_w: 500, battery: '36V 13Ah' } },
  { id: 3, slug: 'kukirin-g4-pro', title: 'Електросамокат KUKIRIN G4 Pro', category_type: 'etransport', brand: 'KUKIRIN', price: 38999, in_stock: true, images: [], is_featured: true, specs: { speed_kmh: 70, range_km: 90, power_w: 2000, battery: '60V 28Ah' } },
  { id: 4, slug: 'giroborda-smart', title: 'Гіроборд Smart Balance 10"', category_type: 'etransport', brand: 'Smart', price: 6499, in_stock: true, images: [], specs: { speed_kmh: 15, range_km: 20, power_w: 700, battery: '36V 4Ah' } },
  { id: 5, slug: 'poliroli-plastik-500', title: 'Поліроль для пластику салону', category_type: 'chemistry', brand: 'Grass', price: 149, in_stock: true, images: [], is_featured: true, specs: { volume_ml: 500, type: 'поліроль', for: 'пластик' } },
  { id: 6, slug: 'shampun-beztorkanniy-1l', title: 'Шампунь безконтактний 1л', category_type: 'chemistry', brand: 'Nowax', price: 220, in_stock: true, images: [], specs: { volume_ml: 1000, type: 'шампунь', for: 'кузов' } },
  { id: 7, slug: 'ochisnik-dvz', title: 'Очисник двигуна 500мл', category_type: 'chemistry', brand: 'Liqui Moly', price: 380, old_price: 450, in_stock: true, images: [], specs: { volume_ml: 500, type: 'очисник', for: 'двигун' } },
  { id: 8, slug: 'antikorozijka-1l', title: 'Антикорозійне покриття 1л', category_type: 'chemistry', brand: 'Grass', price: 295, in_stock: false, images: [], specs: { volume_ml: 1000, type: 'антикор', for: 'днище' } },
  { id: 9, slug: 'shurupovert-18v', title: 'Шуруповерт акумуляторний 18V', category_type: 'tools', brand: 'Makita', price: 2450, in_stock: true, images: [], is_featured: true, specs: { power_w: 0, voltage: '18V', battery_count: 2 } },
  { id: 10, slug: 'dril-udarniy-800w', title: 'Дриль ударний 800Вт', category_type: 'tools', brand: 'Bosch', price: 1890, in_stock: true, images: [], specs: { power_w: 800, voltage: '220V', battery_count: 0 } },
  { id: 11, slug: 'bolgarka-125', title: 'Кутова шліфмашина 125мм', category_type: 'tools', brand: 'DeWalt', price: 2100, old_price: 2400, in_stock: true, images: [], specs: { power_w: 1010, voltage: '220V', battery_count: 0 } },
  { id: 12, slug: 'lobzik-akkum', title: 'Лобзик акумуляторний 20V', category_type: 'tools', brand: 'Makita', price: 3200, in_stock: true, images: [], specs: { power_w: 0, voltage: '20V', battery_count: 1 } },
];

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!supabase) return DEMO_PRODUCTS.filter((p) => p.is_featured);
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('in_stock', true)
    .limit(8);
  return data?.length ? (data as Product[]) : DEMO_PRODUCTS.filter((p) => p.is_featured);
}

export async function getProductsByType(
  type: CategoryType,
  page = 1,
  perPage = 24
): Promise<{ products: Product[]; total: number }> {
  if (!supabase) {
    const all = DEMO_PRODUCTS.filter((p) => p.category_type === type);
    return { products: all, total: all.length };
  }
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('category_type', type)
    .range(from, from + perPage - 1)
    .order('is_featured', { ascending: false });
  return { products: (data as Product[]) ?? [], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const { data } = await supabase.from('products').select('*').eq('slug', slug).single();
  return (data as Product) ?? null;
}

// ── Пошук по всьому каталогу ──
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (!supabase) {
    return DEMO_PRODUCTS.filter((p) =>
      `${p.title} ${p.brand ?? ''}`.toLowerCase().includes(q)
    );
  }
  const { data } = await supabase
    .from('products')
    .select('*')
    .ilike('search_text', `%${q}%`)
    .limit(60);
  return (data as Product[]) ?? [];
}

export interface FilterOptions {
  brands: string[];
  priceMin: number;
  priceMax: number;
}

// Зібрати доступні бренди та діапазон цін для категорії (для UI фільтрів)
export async function getFilterOptions(type: CategoryType): Promise<FilterOptions> {
  let pool: Product[];
  if (!supabase) {
    pool = DEMO_PRODUCTS.filter((p) => p.category_type === type);
  } else {
    const { data } = await supabase
      .from('products')
      .select('brand, price')
      .eq('category_type', type);
    pool = (data as Product[]) ?? [];
  }
  const brands = Array.from(
    new Set(pool.map((p) => p.brand).filter((b): b is string => !!b))
  ).sort();
  const prices = pool.map((p) => p.price ?? 0).filter((n) => n > 0);
  return {
    brands,
    priceMin: prices.length ? Math.floor(Math.min(...prices)) : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
}

// Повний список товарів категорії (для клієнтської фільтрації)
export async function getAllByType(type: CategoryType): Promise<Product[]> {
  if (!supabase) return DEMO_PRODUCTS.filter((p) => p.category_type === type);
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category_type', type)
    .order('is_featured', { ascending: false });
  return (data as Product[]) ?? [];
}
