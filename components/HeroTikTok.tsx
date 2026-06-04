'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/supabase';

const fmtPrice = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function HeroTikTok({ products }: { products: Product[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = products.slice(0, 8);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (items.length === 0) {
    return (
      <div className="hero-card hero-card-empty">
        <span className="tiktok-badge">🔥 TikTok</span>
        <p>Скоро тут з'являться товари з наших відео</p>
      </div>
    );
  }

  const p = items[idx];
  const img = p.images?.[0];

  return (
    <div
      className="hero-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="hero-card-badge">🔥 TikTok</span>

      <a href={`/product/${p.slug}`} className="hero-card-img">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.title} key={p.id} />
        ) : (
          <span className="hero-card-noimg">🛒</span>
        )}
      </a>

      {p.brand && <div className="hero-card-brand">{p.brand}</div>}
      <div className="hero-card-name">{p.title}</div>
      {p.price ? (
        <div className="hero-card-price">{fmtPrice(p.price)} ₴</div>
      ) : (
        <div className="hero-card-price muted">Уточнюйте</div>
      )}
      <a href={`/product/${p.slug}`} className="hero-card-btn">Детальніше →</a>

      {items.length > 1 && (
        <div className="hero-card-dots">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={i === idx ? 'on' : ''}
              onClick={() => setIdx(i)}
              aria-label={`Товар ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
