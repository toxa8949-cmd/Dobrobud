import { notFound } from 'next/navigation';
import {
  getCatalogPage,
  getFilterOptions,
  type CategoryType,
  type CatalogFilters,
} from '@/lib/supabase';
import CatalogGrid from '@/components/CatalogGrid';
import CatalogFiltersComponent from '@/components/CatalogClient';

export const revalidate = 3600;

const META: Record<CategoryType, { title: string }> = {
  etransport: { title: 'Електротранспорт' },
  chemistry: { title: 'Автохімія та хімія' },
  tools: { title: 'Електроінструмент' },
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
    subcategory: q.sub,
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
      <div className="section-head">
        <h2>{META[type].title}</h2>
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>{total} товарів</span>
      </div>

      <div className="catalog-layout">
        <CatalogFiltersComponent options={options} />
        <div className="catalog-main">
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
