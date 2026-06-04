import type { Metadata } from 'next';
import { getBundles } from '@/lib/bundles';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Набори товарів — Добробуд',
  description: 'Готові набори товарів зі знижкою за комплект. Купуйте все з відео разом і економте.',
};

export default async function SetsPage() {
  const bundles = await getBundles();

  return (
    <div className="info-page">
      <div className="info-hero">
        <h1>Набори зі знижкою</h1>
        <p>Купуйте комплектом — і економте на кожному наборі</p>
      </div>

      {bundles.length === 0 ? (
        <p className="adm-muted" style={{ textAlign: 'center' }}>Набори скоро з’являться.</p>
      ) : (
        <div className="blog-grid">
          {bundles.map((b) => {
            const best = [...(b.discount_tiers ?? [])].sort((a, z) =>
              (z.type === 'percent' ? z.value : 0) - (a.type === 'percent' ? a.value : 0)
            )[0];
            return (
              <a key={b.slug} className="blog-card" href={`/set/${b.slug}`}>
                <div className="blog-card-img">{b.emoji}</div>
                <div className="blog-card-body">
                  <div className="blog-card-date">{b.product_ids?.length ?? 0} товарів</div>
                  <h2>{b.title}</h2>
                  {b.description && <p>{b.description}</p>}
                  <span className="blog-card-more">
                    {best
                      ? `Знижка до ${best.type === 'percent' ? best.value + '%' : best.value + ' ₴'} →`
                      : 'Переглянути →'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
