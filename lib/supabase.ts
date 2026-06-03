import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Нормалізація: прибираємо пробіли, переноси рядків, лапки, слеш у кінці
function clean(v: string | undefined): string {
  return (v ?? '')
    .replace(/[\r\n\t]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '');
}

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Клієнт для читання (публічний). Запис — окремий service_role клієнт у cron.
// Ініціалізація повністю захищена: будь-яке криве значення → null,
// сайт працює на демо-даних замість падіння білда.
function initClient(): SupabaseClient | null {
  try {
    if (!url || !anon) return null;
    // Строга перевірка: значення має бути валідним http(s) URL
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return createClient(url, anon, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

export const supabase = initClient();

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
  const demo = DEMO_PRODUCTS.filter((p) => p.is_featured);
  if (!supabase) return demo;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('in_stock', true)
      .limit(8);
    if (error) return demo;
    return data?.length ? (data as Product[]) : demo;
  } catch {
    return demo;
  }
}

export async function getProductsByType(
  type: CategoryType,
  page = 1,
  perPage = 24
): Promise<{ products: Product[]; total: number }> {
  const all = DEMO_PRODUCTS.filter((p) => p.category_type === type);
  if (!supabase) return { products: all, total: all.length };
  try {
    const from = (page - 1) * perPage;
    const { data, count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category_type', type)
      .range(from, from + perPage - 1)
      .order('is_featured', { ascending: false });
    if (error) return { products: all, total: all.length };
    return { products: (data as Product[]) ?? [], total: count ?? 0 };
  } catch {
    return { products: all, total: all.length };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const demo = DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  if (!supabase) return demo;
  try {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (error) return demo;
    return (data as Product) ?? demo;
  } catch {
    return demo;
  }
}

// Схожі товари: спершу з тієї ж підкатегорії, добираємо з типу
export async function getRelatedProducts(p: Product, limit = 4): Promise<Product[]> {
  if (!supabase) {
    return DEMO_PRODUCTS.filter(
      (x) => x.category_type === p.category_type && x.id !== p.id
    ).slice(0, limit);
  }
  try {
    const sub = p.specs?.subcategory as string | undefined;
    // Перший вибір — та сама підкатегорія
    if (sub) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_type', p.category_type)
        .eq('specs->>subcategory', sub)
        .neq('id', p.id)
        .eq('in_stock', true)
        .limit(limit);
      if (data && data.length >= limit) return data as Product[];
      // Добираємо з типу, якщо в підкатегорії замало
      const have = (data as Product[]) ?? [];
      const ids = [p.id, ...have.map((x) => x.id)];
      const { data: extra } = await supabase
        .from('products')
        .select('*')
        .eq('category_type', p.category_type)
        .not('id', 'in', `(${ids.join(',')})`)
        .eq('in_stock', true)
        .limit(limit - have.length);
      return [...have, ...((extra as Product[]) ?? [])];
    }
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_type', p.category_type)
      .neq('id', p.id)
      .eq('in_stock', true)
      .limit(limit);
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

// ── Пошук по всьому каталогу ──
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const demo = DEMO_PRODUCTS.filter((p) =>
    `${p.title} ${p.brand ?? ''}`.toLowerCase().includes(q)
  );
  if (!supabase) return demo;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('search_text', `%${q}%`)
      .limit(60);
    if (error) return demo;
    return (data as Product[]) ?? [];
  } catch {
    return demo;
  }
}

export interface FilterOptions {
  brands: string[];
  subcategories: string[];
  priceMin: number;
  priceMax: number;
}

// Зібрати бренди, підкатегорії та діапазон цін (для UI фільтрів).
// Дані тягнемо легким запитом (тільки потрібні поля) — швидко навіть на 2500+ товарах.
export async function getFilterOptions(type: CategoryType): Promise<FilterOptions> {
  let pool: { brand?: string | null; price?: number | null; specs?: any }[] =
    DEMO_PRODUCTS.filter((p) => p.category_type === type);
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('brand, price, specs')
        .eq('category_type', type)
        .limit(5000);
      if (!error && data) pool = data;
    } catch {
      /* fallback to demo pool */
    }
  }
  const brands = Array.from(
    new Set(pool.map((p) => p.brand).filter((b): b is string => !!b))
  ).sort((a, b) => a.localeCompare(b, 'uk'));
  const subcategories = Array.from(
    new Set(
      pool
        .map((p) => (p.specs?.subcategory as string | undefined))
        .filter((s): s is string => !!s)
    )
  ).sort((a, b) => a.localeCompare(b, 'uk'));
  const prices = pool.map((p) => p.price ?? 0).filter((n) => n > 0);
  return {
    brands,
    subcategories,
    priceMin: prices.length ? Math.floor(Math.min(...prices)) : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
}

// Повний список товарів категорії (для клієнтської фільтрації)
export interface CatalogFilters {
  brand?: string;
  subcategory?: string;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'featured' | 'price-asc' | 'price-desc';
  page?: number;
  perPage?: number;
}

export interface CatalogResult {
  products: Product[];
  total: number;
}

// Серверна вибірка з фільтрами й пагінацією.
// Вантажимо лише одну сторінку — швидко навіть на тисячах товарів.
export async function getCatalogPage(
  type: CategoryType,
  f: CatalogFilters = {}
): Promise<CatalogResult> {
  const perPage = f.perPage ?? 24;
  const page = Math.max(1, f.page ?? 1);

  if (!supabase) {
    let demo = DEMO_PRODUCTS.filter((p) => p.category_type === type);
    if (f.brand) demo = demo.filter((p) => p.brand === f.brand);
    if (f.inStockOnly) demo = demo.filter((p) => p.in_stock);
    if (f.maxPrice) demo = demo.filter((p) => (p.price ?? 0) <= f.maxPrice!);
    return { products: demo, total: demo.length };
  }

  try {
    let q = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category_type', type);

    if (f.brand) q = q.eq('brand', f.brand);
    if (f.subcategory) q = q.eq('specs->>subcategory', f.subcategory);
    if (f.inStockOnly) q = q.eq('in_stock', true);
    if (f.maxPrice) q = q.lte('price', f.maxPrice);

    if (f.sort === 'price-asc') q = q.order('price', { ascending: true });
    else if (f.sort === 'price-desc') q = q.order('price', { ascending: false });
    else q = q.order('is_featured', { ascending: false }).order('id', { ascending: true });

    const from = (page - 1) * perPage;
    q = q.range(from, from + perPage - 1);

    const { data, count, error } = await q;
    if (error) return { products: [], total: 0 };
    return { products: (data as Product[]) ?? [], total: count ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
}
