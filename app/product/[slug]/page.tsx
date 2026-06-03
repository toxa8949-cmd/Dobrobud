import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/supabase';

export const revalidate = 3600;

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

const SPEC_LABELS: Record<string, string> = {
  speed_kmh: 'Максимальна швидкість',
  range_km: 'Запас ходу',
  power_w: 'Потужність',
  battery: 'Акумулятор',
  volume_ml: 'Об\'єм',
  type: 'Тип',
  for: 'Призначення',
  voltage: 'Напруга',
  battery_count: 'Кількість акумуляторів',
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const specEntries = Object.entries(p.specs).filter(([, v]) => v != null && v !== '' && v !== 0);

  return (
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

        <div style={{ marginBottom: 16, color: p.in_stock ? 'var(--green)' : '#a32d2d', fontSize: 14, fontWeight: 500 }}>
          {p.in_stock ? '✓ В наявності' : 'Немає в наявності'}
        </div>

        <button className="buy-btn" disabled={!p.in_stock}>
          Додати в кошик
        </button>

        {specEntries.length > 0 && (
          <table className="spec-table">
            <tbody>
              {specEntries.map(([k, v]) => (
                <tr key={k}>
                  <td>{SPEC_LABELS[k] ?? k}</td>
                  <td>
                    {v}
                    {SPEC_UNITS[k] ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {p.description && <p style={{ color: 'var(--muted)', marginTop: 16 }}>{p.description}</p>}
      </div>
    </div>
  );
}
