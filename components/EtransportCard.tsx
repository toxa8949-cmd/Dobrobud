import Link from 'next/link';
import type { Product } from '@/lib/supabase';
import { FavButton } from './CardActions';
import QuickBuy from './QuickBuy';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function EtransportCard({ p }: { p: Product }) {
  const discount = p.old_price && p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-img">
        {discount > 0 && <span className="badge badge-sale">−{discount}%</span>}
        {p.is_featured && <span className="badge badge-top">ТОП</span>}
        <FavButton />
        {p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" />
        ) : (
          <span className="ph">⚡</span>
        )}
      </div>
      <div className="card-body">
        {p.brand && <span className="brand">{p.brand}</span>}
        <h3 className="card-title">{p.title}</h3>
        <div className="specs">
          {p.specs.speed_kmh && <span>{p.specs.speed_kmh} км/год</span>}
          {p.specs.range_km && <span>{p.specs.range_km} км</span>}
        </div>
        <div className="card-price">
          {p.old_price && <span className="old">{fmt(p.old_price)} ₴</span>}
          <span className="now">{p.price ? fmt(p.price) : '—'} ₴</span>
        </div>
        {p.in_stock ? (
          <QuickBuy id={p.id} slug={p.slug} title={p.title} price={p.price ?? 0} />
        ) : (
          <span className="oos">Немає в наявності</span>
        )}
      </div>
    </Link>
  );
}
