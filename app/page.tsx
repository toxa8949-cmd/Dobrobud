import { getHomeSections } from '@/lib/supabase';
import ProductRow from '@/components/ProductRow';

export const revalidate = 3600;

const fmtCount = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default async function HomePage() {
  const h = await getHomeSections();

  const catCard = (
    type: string,
    href: string,
    emoji: string,
    name: string,
    sub: string
  ) => (
    <a className="hcat" href={href}>
      <div className="hcat-media">
        {h.topImages[type] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={h.topImages[type]} alt={name} loading="lazy" />
        ) : (
          <span className="hcat-emoji">{emoji}</span>
        )}
      </div>
      <div className="hcat-body">
        <span className="hcat-name">{name}</span>
        <span className="hcat-sub">{sub}</span>
        {h.counts[type] ? <span className="hcat-count">{fmtCount(h.counts[type])} товарів</span> : null}
      </div>
    </a>
  );

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="hero-badge">Магазин Добробуд</span>
          <h1>Все для авто, дому та руху — в одному місці</h1>
          <p>Автохімія, оливи, електротранспорт та інструмент. Оригінальні товари з доставкою по всій Україні.</p>
          <div className="hero-actions">
            <a className="hbtn-primary" href="/catalog/chemistry">Перейти до каталогу</a>
            <a className="hbtn-ghost" href="/catalog/etransport">Електротранспорт</a>
          </div>
          <div className="hero-stats">
            <div><strong>{fmtCount((h.counts.chemistry ?? 0) + (h.counts.etransport ?? 0) + (h.counts.tools ?? 0))}+</strong><span>товарів</span></div>
            <div><strong>1–3 дні</strong><span>доставка</span></div>
            <div><strong>14 днів</strong><span>повернення</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-glyph">🛒</span>
        </div>
      </section>

      {/* Category tiles */}
      <section className="hcats">
        {catCard('chemistry', '/catalog/chemistry', '🧴', 'Автохімія та хімія', 'Оливи, поліролі, очисники')}
        {catCard('etransport', '/catalog/etransport', '⚡', 'Електротранспорт', 'Самокати, велосипеди')}
        {catCard('tools', '/catalog/tools', '🔧', 'Електроінструмент', 'Дрилі, шуруповерти')}
      </section>

      {/* Promo strip */}
      <a className="promo-strip" href="/catalog/chemistry?sort=price-asc">
        <div className="promo-left">
          <span className="promo-tag">Вигідно</span>
          <h3>Знижки на автохімію щотижня</h3>
          <p>Оливи, присадки та засоби догляду за найкращими цінами</p>
        </div>
        <span className="promo-cta">Дивитися →</span>
      </a>

      {/* Product rows */}
      {h.deals.length > 0 && <ProductRow title="🔥 Товари зі знижкою" href="/catalog/chemistry?sort=price-asc" products={h.deals} />}
      <ProductRow title="Автохімія та хімія" href="/catalog/chemistry" products={h.chemistry} />
      <ProductRow title="Електротранспорт" href="/catalog/etransport" products={h.etransport} />
      <ProductRow title="Електроінструмент" href="/catalog/tools" products={h.tools} />

      {/* Trust */}
      <section className="trust">
        <div className="trust-item"><span>🚚</span><div><strong>Доставка по Україні</strong><span>Нова Пошта, Укрпошта</span></div></div>
        <div className="trust-item"><span>💳</span><div><strong>Зручна оплата</strong><span>Картка або накладений платіж</span></div></div>
        <div className="trust-item"><span>🛡️</span><div><strong>Гарантія</strong><span>Офіційний товар</span></div></div>
        <div className="trust-item"><span>↩️</span><div><strong>Повернення</strong><span>14 днів на обмін</span></div></div>
      </section>
    </>
  );
}
