import { getHomeSections } from '@/lib/supabase';
import ProductRow from '@/components/ProductRow';
import HeroSlider from '@/components/HeroSlider';

export const revalidate = 3600;

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

      {/* Рядки товарів */}
      {h.deals.length > 0 && <ProductRow title="🔥 Хіти продажів" href="/catalog/chemistry?sort=price-asc" products={h.deals} />}
      <ProductRow title="Автохімія та хімія" href="/catalog/chemistry" products={h.chemistry} />
      <ProductRow title="Електротранспорт" href="/catalog/etransport" products={h.etransport} />
      <ProductRow title="Електроінструмент" href="/catalog/tools" products={h.tools} />
    </>
  );
}
