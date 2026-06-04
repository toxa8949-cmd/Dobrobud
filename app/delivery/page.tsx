import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Доставка та оплата — Добробуд',
  description: 'Умови доставки Новою Поштою та самовивозу. Оплата: повна або часткова передоплата, на ФОП без ПДВ. Магазин у Любарі.',
};

export default function DeliveryPage() {
  return (
    <div className="info-page">
      <div className="info-hero">
        <h1>Доставка та оплата</h1>
        <p>Зручні способи отримати замовлення та розрахуватись</p>
      </div>

      <section className="info-block">
        <h2>🚚 Доставка</h2>
        <p className="info-note">Відправляємо за умови повної оплати або часткової передоплати замовлення.</p>
        <div className="info-cards">
          <div className="info-card">
            <span className="info-ico">📦</span>
            <strong>Нова Пошта</strong>
            <p>Відправляємо у відділення або поштомат по всій Україні. Зазвичай 1–3 дні залежно від міста.</p>
          </div>
          <div className="info-card">
            <span className="info-ico">🏪</span>
            <strong>Самовивіз</strong>
            <p>Можна забрати замовлення особисто з нашого магазину у Любарі — безкоштовно та одразу.</p>
          </div>
        </div>
      </section>

      <section className="info-block">
        <h2>💳 Оплата</h2>
        <div className="info-cards">
          <div className="info-card">
            <span className="info-ico">💳</span>
            <strong>Повна оплата</strong>
            <p>Сплачуєте повну вартість замовлення — і ми одразу відправляємо товар.</p>
          </div>
          <div className="info-card">
            <span className="info-ico">💵</span>
            <strong>Часткова передоплата</strong>
            <p>Вносите частину суми як передоплату, решту — при отриманні. Зручно для дорогих замовлень.</p>
          </div>
          <div className="info-card">
            <span className="info-ico">🧾</span>
            <strong>Оплата на ФОП</strong>
            <p>Безготівковий розрахунок на рахунок ФОП (без ПДВ).</p>
          </div>
        </div>
      </section>

      <section className="info-block">
        <h2>❓ Часті запитання</h2>
        <div className="faq">
          <details className="faq-item">
            <summary>Скільки коштує доставка?</summary>
            <p>Вартість доставки розраховується за тарифами Нової Пошти й залежить від ваги та габаритів. Самовивіз — безкоштовно.</p>
          </details>
          <details className="faq-item">
            <summary>Як швидко відправляєте замовлення?</summary>
            <p>Замовлення в наявності відправляємо протягом робочого дня. Після відправки ви отримаєте номер для відстеження.</p>
          </details>
          <details className="faq-item">
            <summary>Чи можна повернути товар?</summary>
            <p>Так, відповідно до законодавства України про захист прав споживачів. Зверніться до нашої підтримки для оформлення повернення.</p>
          </details>
          <details className="faq-item">
            <summary>Чи є гарантія на товар?</summary>
            <p>Так, на всі товари діє офіційна гарантія від виробника. Термін залежить від категорії товару.</p>
          </details>
        </div>
      </section>

      <section className="info-block info-contacts">
        <h2>Контакти</h2>
        <p>Зв'яжіться з нами — допоможемо з вибором і оформленням:</p>
        <ul>
          <li>📍 вул. Житомирська, Любар, Житомирська область, 13102</li>
          <li>📱 <a href="tel:+380674100159">+380 67 410 0159</a></li>
        </ul>
        <div className="info-socials">
          <a href="https://www.tiktok.com/@pvmorgan" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://facebook.com/lub.dobrobud" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://t.me/ProkopenkoVasyl" target="_blank" rel="noopener noreferrer">Telegram</a>
        </div>
      </section>
    </div>
  );
}
