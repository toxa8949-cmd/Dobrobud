import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Про нас — Добробуд',
  description: 'Добробуд — магазин електротранспорту, автохімії та інструменту з доставкою по всій Україні.',
};

export default function AboutPage() {
  return (
    <div className="about">
      <div className="about-hero">
        <h1>Про «Добробуд»</h1>
        <p>Магазин електротранспорту, автохімії та інструменту з доставкою по всій Україні.</p>
      </div>

      <section className="about-block">
        <h2>Хто ми</h2>
        <p>
          «Добробуд» — український інтернет-магазин, де зібрано все для руху та догляду за технікою:
          електроскутери, велосипеди й самокати, професійна автохімія та оливи, а також надійний
          електроінструмент. Ми відбираємо товари перевірених брендів і пропонуємо їх за чесними цінами.
        </p>
      </section>

      <section className="about-block">
        <h2>Чому обирають нас</h2>
        <div className="about-grid">
          <div className="about-card">
            <span className="about-ico">🚚</span>
            <strong>Доставка по Україні</strong>
            <p>Нова Пошта та Укрпошта в будь-який куточок країни.</p>
          </div>
          <div className="about-card">
            <span className="about-ico">💳</span>
            <strong>Зручна оплата</strong>
            <p>Картка, накладений платіж або безготівковий розрахунок.</p>
          </div>
          <div className="about-card">
            <span className="about-ico">🛡️</span>
            <strong>Офіційний товар</strong>
            <p>Тільки оригінальна продукція від виробників і офіційних постачальників.</p>
          </div>
          <div className="about-card">
            <span className="about-ico">📞</span>
            <strong>Підтримка</strong>
            <p>Допоможемо з вибором і відповімо на запитання до та після покупки.</p>
          </div>
        </div>
      </section>

      <section className="about-block">
        <h2>Наш асортимент</h2>
        <div className="about-cats">
          <a href="/catalog/etransport" className="about-cat">
            <span>⚡</span>
            <div><strong>Електротранспорт</strong><span>Скутери, велосипеди, самокати</span></div>
          </a>
          <a href="/catalog/chemistry" className="about-cat">
            <span>🧴</span>
            <div><strong>Автохімія та оливи</strong><span>Догляд і обслуговування авто</span></div>
          </a>
          <a href="/catalog/tools" className="about-cat">
            <span>🔧</span>
            <div><strong>Електроінструмент</strong><span>Для роботи та дому</span></div>
          </a>
        </div>
      </section>

      <section className="about-block about-contacts">
        <h2>Контакти</h2>
        <p>Маєте запитання? Зв'яжіться з нами:</p>
        <ul>
          <li>📧 Пошта: <a href="mailto:info@dobrobud.ua">info@dobrobud.ua</a></li>
          <li>📱 Телефон: +38 (0XX) XXX-XX-XX</li>
        </ul>
      </section>
    </div>
  );
}
