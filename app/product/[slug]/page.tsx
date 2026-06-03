import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/supabase';
import BuyBox from '@/components/BuyBox';
import CatalogGrid from '@/components/CatalogGrid';

export const revalidate = 3600;

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

const SPEC_LABELS: Record<string, string> = {
  speed_kmh: 'Максимальна швидкість',
  range_km: 'Запас ходу',
  power_w: 'Потужність',
  battery: 'Акумулятор',
  battery_type: 'Тип акумулятора',
  model: 'Модель',
  wheel: 'Колеса',
  volume_ml: "Об'єм",
  type: 'Тип',
  for: 'Призначення',
  voltage: 'Напруга',
  battery_count: 'Кількість акумуляторів',
  subcategory: 'Категорія',
  article: 'Артикул',
};

const SPEC_UNITS: Record<string, string> = {
  speed_kmh: ' км/год',
  range_km: ' км',
  power_w: ' Вт',
  volume_ml: ' мл',
};

const PLACEHOLDER: Record<string, string> = {
  etransport: '⚡',
  chemistry: '🧴',
  tools: '🔧',
};

const CAT_NAME: Record<string, string> = {
  etransport: 'Електротранспорт',
  chemistry: 'Автохімія та хімія',
  tools: 'Електроінструмент',
};

const CAT_SLUG: Record<string, string> = {
  etransport: 'etransport',
  chemistry: 'chemistry',
  tools: 'tools',
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = await getRelatedProducts(p);

  // Характеристики: впорядковано, з людськими назвами, артикул/категорія в кінці
  const order = ['speed_kmh', 'range_km', 'power_w', 'battery', 'voltage', 'battery_count', 'volume_ml', 'type', 'for', 'subcategory', 'article'];
  const HIDDEN_SPECS = ['source_url'];
  const specEntries = Object.entries(p.specs)
    .filter(([k, v]) => v != null && v !== '' && v !== 0 && !HIDDEN_SPECS.includes(k))
    .sort(([a], [b]) => {
      const ia = order.indexOf(a); const ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  return (
    <>
      <nav className="breadcrumbs">
        <a href="/">Головна</a>
        <span>/</span>
        <a href={`/catalog/${CAT_SLUG[p.category_type]}`}>{CAT_NAME[p.category_type]}</a>
        <span>/</span>
        <span className="current">{p.title}</span>
      </nav>

      <div className="product">
        <div className="product-gallery">
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0]} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span className="ph">{PLACEHOLDER[p.category_type]}</span>
          )}
        </div>

        <div>
          {p.brand && <span className="brand">{p.brand}</span>}
          <h1>{p.title}</h1>

          <div style={{ margin: '12px 0' }}>
            <span className="price-now">{p.price ? fmt(p.price) : '—'} ₴</span>
            {p.old_price && <span className="price-old">{fmt(p.old_price)} ₴</span>}
          </div>

          <div className={`stock-badge ${p.in_stock ? 'in' : 'out'}`}>
            {p.in_stock ? '✓ В наявності' : 'Немає в наявності'}
          </div>

          <BuyBox id={p.id} slug={p.slug} title={p.title} price={p.price ?? 0} inStock={p.in_stock} />

          <div className="perks">
            <div className="perk"><span className="perk-ico">🚚</span><div><strong>Доставка по Україні</strong><span>Нова Пошта, Укрпошта</span></div></div>
            <div className="perk"><span className="perk-ico">💳</span><div><strong>Зручна оплата</strong><span>Картка, накладений платіж, безготівка</span></div></div>
            <div className="perk"><span className="perk-ico">🛡️</span><div><strong>Гарантія якості</strong><span>Офіційний товар</span></div></div>
          </div>
        </div>
      </div>

      {(p.description || specEntries.length > 0) && (
        <div className="product-details">
          {p.description && (
            <section className="detail-block">
              <h2>Опис</h2>
              <p>{p.description}</p>
            </section>
          )}
          {specEntries.length > 0 && (
            <section className="detail-block">
              <h2>Характеристики</h2>
              <table className="spec-table">
                <tbody>
                  {specEntries.map(([k, v]) => (
                    <tr key={k}>
                      <td>{SPEC_LABELS[k] ?? k}</td>
                      <td>{v}{SPEC_UNITS[k] ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      )}

      {related.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 40 }}>
            <h2>Схожі товари</h2>
          </div>
          <CatalogGrid products={related} />
        </>
      )}
    </>
  );
}
