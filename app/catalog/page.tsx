import type { Metadata } from 'next';
import { getFilterOptions } from '@/lib/supabase';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Каталог — Добробуд',
  description: 'Усі категорії товарів: транспорт, автохімія, інструмент. Оберіть розділ і знайдіть потрібне.',
};

const SECTIONS = [
  { type: 'etransport', title: 'Транспорт', glyph: '🚲', color: '#dbeafe', desc: 'Електроскутери, велосипеди, самокати, трицикли' },
  { type: 'chemistry', title: 'Автохімія та оливи', glyph: '🧴', color: '#fce7f3', desc: 'Оливи, емалі, AdBlue, догляд за авто' },
  { type: 'tools', title: 'Електроінструмент', glyph: '🔧', color: '#fef3c7', desc: 'Дрилі, шуруповерти, болгарки' },
] as const;

export default async function CatalogIndexPage() {
  // тягнемо підкатегорії для кожного розділу
  const [etOpts, chOpts, toOpts] = await Promise.all([
    getFilterOptions('etransport'),
    getFilterOptions('chemistry'),
    getFilterOptions('tools'),
  ]);
  const optsByType: Record<string, typeof etOpts> = {
    etransport: etOpts,
    chemistry: chOpts,
    tools: toOpts,
  };

  return (
    <div className="catalog-index">
      <div className="ci-head">
        <h1>Каталог</h1>
        <p>Оберіть розділ і перейдіть до потрібної категорії товарів</p>
      </div>

      <div className="ci-sections">
        {SECTIONS.map((s) => {
          const subs = optsByType[s.type]?.subcatCounts ?? [];
          const total = optsByType[s.type]?.subcatCounts.reduce((a, b) => a + b.count, 0) ?? 0;
          return (
            <div className="ci-section" key={s.type}>
              <a className="ci-section-head" href={`/catalog/${s.type}`} style={{ background: s.color }}>
                <span className="ci-glyph">{s.glyph}</span>
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </div>
                <span className="ci-arrow">→</span>
              </a>
              {subs.length > 0 ? (
                <div className="ci-subs">
                  {subs.map((sub) => (
                    <a
                      key={sub.name}
                      className="ci-sub"
                      href={`/catalog/${s.type}?sub=${encodeURIComponent(sub.name)}`}
                    >
                      {sub.name}
                      <span className="ci-sub-count">{sub.count}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="ci-soon">Товари з'являться найближчим часом</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
