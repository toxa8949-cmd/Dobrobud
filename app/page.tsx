import { getHomeSections } from '@/lib/supabase';
import ProductRow from '@/components/ProductRow';
import TikTokCard from '@/components/TikTokCard';
import HeroSlider from '@/components/HeroSlider';

export const revalidate = 60;

const fmtCount = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default async function HomePage() {
  const h = await getHomeSections();

  const cat = (
    type: string,
    href: string,
    emoji: string,
    name: string,
    bg: string
  ) => (
    <a className="mcat" href={href}>
      <div className="mcat-ico" style={{ background: bg }}>
        {h.topImages[type] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={h.topImages[type]} alt={name} loading="lazy" />
        ) : (
          <span>{emoji}</span>
        )}
      </div>
      <div>
        <div className="mcat-name">{name}</div>
        <div className="mcat-count">{h.counts[type] ? `${fmtCount(h.counts[type])} товарів` : 'Скоро'}</div>
      </div>
    </a>
  );

  return (
    <>
      {/* TikTok вітрина — найперше, що бачить відвідувач */}
      {h.tiktok.length > 0 && (
        <section className="tiktok-row">
          <div className="tiktok-row-head">
            <span className="tiktok-badge">🔥 TikTok</span>
            <h2>Бачили у нашому TikTok?</h2>
            <a className="tiktok-row-all" href="/tiktok">Усі товари →</a>
          </div>
          <div className="prow-scroll">
            {h.tiktok.map((p) => (
              <div className="prow-item" key={p.id}>
                <TikTokCard p={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero + промо */}
      <section className="home-top">
        <HeroSlider />
        <div className="home-promos">
          <a className="promo-card promo-amber" href="/catalog/chemistry?sort=price-asc">
            <span className="pc-tag">Акція</span>
            <strong>Автохімія −15%</strong>
            <span className="pc-sub">До кінця тижня</span>
          </a>
          <a className="promo-card promo-green" href="/catalog/tools">
            <span className="pc-tag">Новинки</span>
            <strong>Інструмент</strong>
            <span className="pc-sub">Щойно завезли</span>
          </a>
        </div>
      </section>

      {/* Плитки категорій */}
      <section className="mcats">
        {cat('etransport', '/catalog/etransport', '⚡', 'Електротранспорт', '#dbeafe')}
        {cat('chemistry', '/catalog/chemistry', '🧴', 'Автохімія', '#fce7f3')}
        {cat('tools', '/catalog/tools', '🔧', 'Інструмент', '#fef3c7')}
        {cat('chemistry', '/catalog/chemistry?sub=Моторні оливи', '🛢️', 'Оливи', '#f3e8ff')}
      </section>

      {/* Популярні категорії з фото */}
      {h.topSubcats.length > 0 && (
        <section className="topcats">
          <div className="section-head">
            <h2>Популярні категорії</h2>
          </div>
          <div className="topcats-grid">
            {h.topSubcats.map((s) => (
              <a
                key={s.name}
                className="topcat"
                href={`/catalog/chemistry?sub=${encodeURIComponent(s.name)}`}
              >
                <div className="topcat-img">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={s.name} loading="lazy" />
                  ) : (
                    <span>🧴</span>
                  )}
                </div>
                <div className="topcat-name">{s.name}</div>
                <div className="topcat-count">{fmtCount(s.count)}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Рядки товарів */}
      {h.deals.length > 0 && <ProductRow title="🔥 Хіти продажів" href="/catalog/chemistry?sort=price-asc" products={h.deals} />}
      <ProductRow title="Автохімія та хімія" href="/catalog/chemistry" products={h.chemistry} />
      <ProductRow title="Електротранспорт" href="/catalog/etransport" products={h.etransport} />
      <ProductRow title="Електроінструмент" href="/catalog/tools" products={h.tools} />

      {/* Бренди */}
      {h.topBrands.length > 0 && (
        <section className="brands">
          <div className="section-head">
            <h2>Бренди</h2>
          </div>
          <div className="brands-grid">
            {h.topBrands.map((b) => (
              <a key={b} className="brand-chip" href={`/catalog/chemistry?brand=${encodeURIComponent(b)}`}>
                {b}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
