'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/lib/cart';
import { calcBundle, nextTier, type DiscountTier } from '@/lib/bundles';
import type { Product } from '@/lib/supabase';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function BundleClient({
  products,
  tiers,
}: {
  products: Product[];
  tiers: DiscountTier[];
}) {
  const { add } = useCart();
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(products.filter((p) => p.in_stock && p.price).map((p) => p.id))
  );
  const [added, setAdded] = useState(false);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAdded(false);
  };

  const chosen = products.filter((p) => selected.has(p.id));
  const prices = chosen.map((p) => p.price ?? 0);

  const { subtotal, discount, total, tier } = useMemo(
    () => calcBundle(prices, tiers),
    [prices.join(','), tiers]
  );

  const next = nextTier(tiers, chosen.length);
  const allInStock = products.every((p) => p.in_stock && p.price);

  const addBundle = () => {
    if (chosen.length === 0) return;
    const ratio = subtotal > 0 ? total / subtotal : 1;
    chosen.forEach((p) => {
      const discounted = Math.round((p.price ?? 0) * ratio);
      add({ id: p.id, slug: p.slug, title: p.title, price: discounted }, 1);
    });
    setAdded(true);
  };

  return (
    <div className="bundle">
      <div className="bundle-items">
        {products.map((p) => {
          const disabled = !p.in_stock || !p.price;
          const on = selected.has(p.id);
          return (
            <label
              key={p.id}
              className={`bundle-item ${on ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
            >
              <span className="bundle-item-check">
                <input type="checkbox" checked={on} disabled={disabled} onChange={() => toggle(p.id)} />
              </span>
              <span className="bundle-item-img">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.title} />
                ) : (
                  <span className="bundle-item-noimg">📦</span>
                )}
              </span>
              <span className="bundle-item-info">
                <span className="bundle-item-title">{p.title}</span>
                {p.brand && <span className="bundle-item-brand">{p.brand}</span>}
                {disabled && <span className="bundle-item-out">Немає в наявності</span>}
                <a
                  href={`/product/${p.slug}`}
                  className="bundle-item-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Переглянути товар →
                </a>
              </span>
              <span className="bundle-item-price">{p.price ? `${fmt(p.price)} ₴` : '—'}</span>
            </label>
          );
        })}
      </div>

      <div className="bundle-summary">
        {/* Великий акцент на економії */}
        {discount > 0 ? (
          <div className="bundle-save">
            <span className="bundle-save-label">Ваша економія</span>
            <span className="bundle-save-value">{fmt(discount)} ₴</span>
          </div>
        ) : (
          <div className="bundle-save bundle-save-muted">
            <span className="bundle-save-label">Оберіть товари, щоб отримати знижку</span>
          </div>
        )}

        {tiers.length > 0 && (
          <div className="bundle-tiers">
            <span>Знижка за кількість:</span>
            <div className="bundle-tiers-list">
              {[...tiers].sort((a, b) => a.min - b.min).map((t, i) => (
                <span key={i} className={`bundle-tier-chip ${tier && tier.min === t.min ? 'active' : ''}`}>
                  {t.min}+ шт → {t.type === 'percent' ? `−${t.value}%` : `−${fmt(t.value)} ₴`}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bundle-row"><span>Обрано {chosen.length} товарів</span><span>{fmt(subtotal)} ₴</span></div>
        {discount > 0 && (
          <div className="bundle-row bundle-discount">
            <span>Знижка{tier && tier.type === 'percent' ? ` −${tier.value}%` : ''}</span>
            <span>−{fmt(discount)} ₴</span>
          </div>
        )}
        <div className="bundle-row bundle-total"><span>До сплати</span><span>{fmt(total)} ₴</span></div>

        {next && chosen.length > 0 && (
          <p className="bundle-hint">
            🎁 Додайте ще {next.min - chosen.length} {next.min - chosen.length === 1 ? 'товар' : 'товари'} → знижка{' '}
            {next.type === 'percent' ? `−${next.value}%` : `−${fmt(next.value)} ₴`}
          </p>
        )}

        <button className="bundle-btn" onClick={addBundle} disabled={chosen.length === 0}>
          {added ? '✓ Додано в кошик' : `Додати набір у кошик · ${fmt(total)} ₴`}
        </button>
        {added && <a href="/cart" className="bundle-tocart">Перейти в кошик →</a>}

        {/* Елементи довіри */}
        <div className="bundle-trust">
          {allInStock && <span><b>✓</b> Усі товари в наявності</span>}
          <span><b>🚚</b> Доставка Новою Поштою по Україні</span>
          <span><b>🛡️</b> Гарантія та офіційна якість</span>
        </div>
      </div>

      {/* Липка кнопка для мобільного */}
      <div className="bundle-sticky">
        <div className="bundle-sticky-info">
          <span className="bundle-sticky-total">{fmt(total)} ₴</span>
          {discount > 0 && <span className="bundle-sticky-save">економія {fmt(discount)} ₴</span>}
        </div>
        <button className="bundle-sticky-btn" onClick={addBundle} disabled={chosen.length === 0}>
          {added ? '✓ Додано' : 'У кошик'}
        </button>
      </div>
    </div>
  );
}
