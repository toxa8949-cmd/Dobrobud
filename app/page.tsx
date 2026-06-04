import { getHomeSections } from '@/lib/supabase';
import { getBundles } from '@/lib/bundles';
import ProductRow from '@/components/ProductRow';
import HeroTikTok from '@/components/HeroTikTok';

export const revalidate = 60;

const fmtCount = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default async function HomePage() {
  const h = await getHomeSections();
  const bundles = await getBundles();

  return (
    <>
      {/* Герой-банер з TikTok-каруселлю */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-left">
            <span className="hero-tag">🔥 ТОВАРИ З НАШОГО TIKTOK</span>
            <h1 className="hero-title">Бачили у нашому <span>TikTok?</span></h1>
            <p className="hero-sub">
              Товари, які ви бачили у наших відео — тут. Транспорт, автохімія та
              інструмент з доставкою по всій Україні.
            </p>
            <div className="hero-btns">
              <a className="hero-btn-primary" href="/tiktok">Дивитися всі →</a>
              <a className="hero-btn-ghost" href="/catalog">Каталог</a>
            </div>
            <div className="hero-perks">
              <div className="hero-perk">
                <strong>🚚 Доставка</strong>
                <span>Нова Пошта або самовивіз</span>
              </div>
              <div className="hero-perk">
                <strong>🛡️ Гарантія</strong>
                <span>Офіційний товар</span>
              </div>
            </div>
          </div>
          <HeroTikTok products={h.tiktok} bundles={bundles} />
        </div>
      </section>

      {/* Переваги / довіра */}
      <section className="trust">
        <div className="trust-row">
          <div className="trust-item">
            <span className="trust-ico">🚚</span>
            <div><strong>Доставка по Україні</strong><span>Нова Пошта або самовивіз</span></div>
          </div>
          <div className="trust-item">
            <span className="trust-ico">💳</span>
            <div><strong>Зручна оплата</strong><span>Картка, накладений платіж</span></div>
          </div>
          <div className="trust-item">
            <span className="trust-ico">🛡️</span>
            <div><strong>Офіційний товар</strong><span>Гарантія якості</span></div>
          </div>
          <div className="trust-item">
            <span className="trust-ico">📞</span>
            <div><strong>Підтримка</strong><span>Допоможемо з вибором</span></div>
          </div>
        </div>
        <div className="trust-exp">
          <div className="te-item">
            <strong>20+ років</strong>
            <span>на ринку України</span>
          </div>
          <div className="te-sep" />
          <div className="te-item">
            <strong>Офлайн-магазин</strong>
            <span>можна прийти й оглянути товар</span>
          </div>
          <div className="te-sep" />
          <div className="te-item">
            <strong>Тисячі клієнтів</strong>
            <span>та перевірена репутація</span>
          </div>
        </div>
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
      <ProductRow title="Транспорт" href="/catalog/etransport" products={h.etransport} />
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
