import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Доставка та оплата — Добробуд',
  description: 'Умови доставки Новою Поштою та самовивозу, способи оплати: картка, накладений платіж, безготівковий розрахунок.',
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
        <div className="info-cards">
          <div className="info-card">
            <span className="info-ico">📦</span>
            <strong>Нова Пошта</strong>
            <p>Відправляємо у відділення або поштомат по всій Україні. Зазвичай 1–3 дні залежно від міста.</p>
          </div>
          <div className="info-card">
            <span className="info-ico">🏪</span>
            <strong>Самовивіз</strong>
            <p>Можна забрати замовлення особисто з нашого магазину — безкоштовно та одразу.</p>
          </div>
        </div>
      </section>

      <section className="info-block">
        <h2>💳 Оплата</h2>
        <div className="info-cards">
          <div className="info-card">
            <span className="info-ico">💳</span>
            <strong>Карткою онлайн</strong>
            <p>Оплата банківською карткою Visa або Mastercard при оформленні замовлення.</p>
          </div>
          <div className="info-card">
            <span className="info-ico">💵</span>
            <strong>Накладений платіж</strong>
            <p>Оплата при отриманні у відділенні Нової Пошти (післяплата).</p>
          </div>
          <div className="info-card">
            <span className="info-ico">🧾</span>
            <strong>Безготівковий розрахунок</strong>
            <p>Для юридичних осіб — оплата за реквізитами з ПДВ.</p>
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
        <h2>Залишились питання?</h2>
        <p>Зв'яжіться з нами — допоможемо з вибором і оформленням:</p>
        <ul>
          <li>📧 <a href="mailto:info@dobrobud.ua">info@dobrobud.ua</a></li>
          <li>📱 +38 (0XX) XXX-XX-XX</li>
        </ul>
      </section>
    </div>
  );
}
