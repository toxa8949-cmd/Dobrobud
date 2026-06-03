import { notFound } from 'next/navigation';
import {
  getCatalogPage,
  getFilterOptions,
  type CategoryType,
  type CatalogFilters,
} from '@/lib/supabase';
import CatalogGrid from '@/components/CatalogGrid';
import CatalogFiltersComponent from '@/components/CatalogClient';
import CatalogSort from '@/components/CatalogSort';

export const revalidate = 3600;

const META: Record<CategoryType, { title: string; tag: string; heading: string; sub: string; glyph: string }> = {
  etransport: {
    title: 'Транспорт',
    tag: 'Рух — це життя',
    heading: 'Електроскутери, велосипеди та самокати',
    sub: 'Великий вибір транспорту й велотоварів з доставкою по Україні',
    glyph: '🚲',
  },
  chemistry: {
    title: 'Автохімія та хімія',
    tag: 'Вигідні ціни',
    heading: 'Все для авто в одному місці',
    sub: 'Оригінальна автохімія, оливи та матеріали з доставкою по Україні',
    glyph: '🛒',
  },
  tools: {
    title: 'Електроінструмент',
    tag: 'Для роботи та дому',
    heading: 'Надійний інструмент для будь-яких задач',
    sub: 'Дрилі, шуруповерти, болгарки та оснащення з доставкою по Україні',
    glyph: '🔧',
  },
};

const PER_PAGE = 24;

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { category } = await params;
  if (!(category in META)) notFound();
  const type = category as CategoryType;

  const q = await searchParams;
  const page = Math.max(1, Number(q.page) || 1);
  const filters: CatalogFilters = {
    brand: q.brand,
    group: q.sub,
    size: q.size,
    maxPrice: Number(q.maxPrice) || undefined,
    inStockOnly: q.inStock === '1',
    sort: (q.sort as CatalogFilters['sort']) || 'featured',
    page,
    perPage: PER_PAGE,
  };

  const [{ products, total }, options] = await Promise.all([
    getCatalogPage(type, filters),
    getFilterOptions(type),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Зберігаємо поточні фільтри в посиланнях пагінації
  const baseParams = new URLSearchParams();
  if (q.brand) baseParams.set('brand', q.brand);
  if (q.sub) baseParams.set('sub', q.sub);
  if (q.maxPrice) baseParams.set('maxPrice', q.maxPrice);
  if (q.inStock) baseParams.set('inStock', q.inStock);
  if (q.sort) baseParams.set('sort', q.sort);
  const pageHref = (n: number) => {
    const p = new URLSearchParams(baseParams);
    p.set('page', String(n));
    return `/catalog/${category}?${p.toString()}`;
  };

  // Вікно сторінок навколо поточної
  const win = 2;
  const pages: number[] = [];
  for (let i = Math.max(1, page - win); i <= Math.min(totalPages, page + win); i++) {
    pages.push(i);
  }

  return (
    <>
      <div className="catalog-banner">
        <div>
          <span className="cb-tag">{META[type].tag}</span>
          <h3>{META[type].heading}</h3>
          <p>{META[type].sub}</p>
        </div>
        <span className="cb-glyph">{META[type].glyph}</span>
      </div>

      <div className="catalog-layout">
        <CatalogFiltersComponent options={options} />
        <div className="catalog-main">
          <CatalogSort total={total} />
          <CatalogGrid products={products} />

          {totalPages > 1 && (
            <nav className="pagination">
              {page > 1 && <a href={pageHref(page - 1)}>←</a>}
              {pages[0] > 1 && (
                <>
                  <a href={pageHref(1)}>1</a>
                  {pages[0] > 2 && <span className="dots">…</span>}
                </>
              )}
              {pages.map((n) => (
                <a key={n} href={pageHref(n)} className={n === page ? 'active' : ''}>
                  {n}
                </a>
              ))}
              {pages[pages.length - 1] < totalPages && (
                <>
                  {pages[pages.length - 1] < totalPages - 1 && <span className="dots">…</span>}
                  <a href={pageHref(totalPages)}>{totalPages}</a>
                </>
              )}
              {page < totalPages && <a href={pageHref(page + 1)}>→</a>}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
