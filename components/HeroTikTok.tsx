'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/supabase';
import type { Bundle } from '@/lib/bundles';

const fmtPrice = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

type Slide =
  | { kind: 'bundle'; bundle: Bundle }
  | { kind: 'product'; product: Product };

function bestDiscount(b: Bundle): string {
  const tiers = b.discount_tiers ?? [];
  if (!tiers.length) return '';
  const best = [...tiers].sort((a, z) => {
    const av = a.type === 'percent' ? a.value : 0;
    const zv = z.type === 'percent' ? z.value : 0;
    return zv - av;
  })[0];
  if (!best) return '';
  return best.type === 'percent' ? `знижка до −${best.value}%` : `знижка до −${fmtPrice(best.value)} ₴`;
}

export default function HeroTikTok({
  products,
  bundles = [],
}: {
  products: Product[];
  bundles?: Bundle[];
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Набори першими, потім товари
  const slides: Slide[] = [
    ...bundles.map((b) => ({ kind: 'bundle' as const, bundle: b })),
    ...products.map((p) => ({ kind: 'product' as const, product: p })),
  ].slice(0, 8);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="hero-card hero-card-empty">
        <span className="tiktok-badge">🔥 TikTok</span>
        <p>Скоро тут з&apos;являться товари з наших відео</p>
      </div>
    );
  }

  const s = slides[idx % slides.length];

  return (
    <div className="hero-card" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {s.kind === 'bundle' ? (
        <BundleCard b={s.bundle} />
      ) : (
        <ProductCard p={s.product} />
      )}

      {slides.length > 1 && (
        <div className="hero-card-dots">
          {slides.map((it, i) => (
            <button
              key={i}
              className={i === idx ? 'on' : ''}
              onClick={() => setIdx(i)}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0];
  return (
    <>
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
    </>
  );
}

function BundleCard({ b }: { b: Bundle }) {
  const disc = bestDiscount(b);
  return (
    <>
      <span className="hero-card-badge hero-card-badge-set">🎁 Набір</span>
      <a href={`/set/${b.slug}`} className="hero-card-img">
        {b.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.image} alt={b.title} key={b.id} />
        ) : (
          <span className="hero-card-noimg">{b.emoji || '🎁'}</span>
        )}
      </a>
      <div className="hero-card-brand">Набір з TikTok</div>
      <div className="hero-card-name">{b.title}</div>
      <div className="hero-card-price">
        {b.product_ids?.length ?? 0} товарів{disc ? ` · ${disc}` : ''}
      </div>
      <a href={`/set/${b.slug}`} className="hero-card-btn">Відкрити набір →</a>
    </>
  );
}
