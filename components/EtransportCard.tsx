import Link from 'next/link';
import type { Product } from '@/lib/supabase';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function EtransportCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-img">
        {p.old_price && <span className="badge badge-sale">Акція</span>}
        {p.is_featured && <span className="badge badge-top">ТОП</span>}
        {p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" />
        ) : (
          <span className="ph">⚡</span>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{p.title}</h3>
        <div className="specs">
          {p.specs.speed_kmh && <span>{p.specs.speed_kmh} км/год</span>}
          {p.specs.range_km && <span>{p.specs.range_km} км ходу</span>}
          {p.specs.power_w ? <span>{p.specs.power_w} Вт</span> : null}
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
