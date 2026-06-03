import { getFeaturedProducts } from '@/lib/supabase';
import CatalogGrid from '@/components/CatalogGrid';

// ISR: сторінка кешується, перегенерується раз на годину
export const revalidate = 3600;

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <section className="bento">
        <div className="bento-hero">
          <span className="glyph">⚡</span>
          <div>
            <span className="tag">№1 напрямок · електротранспорт</span>
            <h1>Електросамокати, велосипеди та техніка</h1>
            <p>Перевір запас ходу, потужність і батарею. Порівняння моделей в один клік.</p>
          </div>
          <div className="actions">
            <a className="btn-light" href="/catalog/etransport">Обрати модель →</a>
            <a className="btn-ghost" href="/catalog/etransport">Порівняти</a>
          </div>
        </div>

        <a className="bento-cat" href="/catalog/chemistry">
          <span className="ico">🧴</span>
          <span className="name">Автохімія та хімія</span>
          <span className="sub">Догляд за авто і не тільки</span>
        </a>
        <a className="bento-cat" href="/catalog/tools">
          <span className="ico">🔧</span>
          <span className="name">Електроінструмент</span>
          <span className="sub">Дрилі, шуруповерти, болгарки</span>
        </a>

        <a className="bento-promo" href="/catalog/etransport">
          <div>
            <span className="tag">Акція тижня</span>
            <div className="ttl">Електросамокати −15%</div>
          </div>
          <span className="pct">−15%</span>
        </a>
        <div className="bento-info">
          <span className="ico">🚚</span>
          <span className="name">Доставка по Україні</span>
        </div>
        <div className="bento-info">
          <span className="ico">🛡️</span>
          <span className="name">Гарантія та сервіс</span>
        </div>
      </section>

      <div className="section-head">
        <h2>Популярні товари</h2>
        <a href="/catalog/etransport">Усі товари →</a>
      </div>
      <CatalogGrid products={featured} />
    </>
  );
}
