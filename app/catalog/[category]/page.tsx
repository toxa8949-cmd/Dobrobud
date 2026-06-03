import { notFound } from 'next/navigation';
import { getProductsByType, type CategoryType } from '@/lib/supabase';
import CatalogGrid from '@/components/CatalogGrid';

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
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;
  if (!(category in META)) notFound();

  const type = category as CategoryType;
  const page = Math.max(1, Number(pageStr) || 1);
  const { products, total } = await getProductsByType(type, page, PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <div className="section-head">
        <h2>{META[type].title}</h2>
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>{total} товарів</span>
      </div>

      <CatalogGrid products={products} />

      {totalPages > 1 && (
        <nav style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <a
                key={n}
                href={`/catalog/${category}?page=${n}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: active ? 'var(--green-bright)' : 'var(--card)',
                  color: active ? '#fff' : 'var(--ink)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                }}
              >
                {n}
              </a>
            );
          })}
        </nav>
      )}
    </>
  );
}
