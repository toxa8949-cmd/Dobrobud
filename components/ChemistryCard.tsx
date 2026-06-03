import Link from 'next/link';
import type { Product } from '@/lib/supabase';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function ChemistryCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-img">
        {p.old_price && <span className="badge badge-sale">Акція</span>}
        {p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" />
        ) : (
          <span className="ph">🧴</span>
        )}
      </div>
      <div className="card-body">
        {p.brand && <span className="brand">{p.brand}</span>}
        <h3 className="card-title">{p.title}</h3>
        <div className="specs">
          {p.specs.volume_ml && <span>{p.specs.volume_ml} мл</span>}
          {p.specs.type && <span>{p.specs.type}</span>}
        </div>
        <div className="card-price">
          {p.old_price && <span className="old">{fmt(p.old_price)} ₴</span>}
          <span className="now">{p.price ? fmt(p.price) : '—'} ₴</span>
        </div>
        {!p.in_stock && <span className="oos">Немає в наявності</span>}
      </div>
    </Link>
  );
}
