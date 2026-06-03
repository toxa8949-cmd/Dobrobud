import { searchProducts } from '@/lib/supabase';
import CatalogGrid from '@/components/CatalogGrid';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const results = q ? await searchProducts(q) : [];

  return (
    <>
      <div className="section-head">
        <h2>
          {q ? `Результати пошуку: «${q}»` : 'Пошук'}
        </h2>
        {q && <span style={{ color: 'var(--muted)', fontSize: 14 }}>{results.length} знайдено</span>}
      </div>

      {!q ? (
        <p className="empty">Введіть запит у полі пошуку зверху.</p>
      ) : results.length === 0 ? (
        <p className="empty">За запитом «{q}» нічого не знайдено. Спробуйте інші слова.</p>
      ) : (
        <CatalogGrid products={results} />
      )}
    </>
  );
}
