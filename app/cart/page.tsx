'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/lib/cart';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState<'np' | 'pickup'>('np');
  const [form, setForm] = useState({ name: '', phone: '+380', city: '', branch: '', note: '' });

  // Економія: сума (oldPrice - price) по всіх товарах
  const savings = useMemo(
    () => items.reduce((s, i) => s + ((i.oldPrice ?? i.price) - i.price) * i.qty, 0),
    [items]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const city =
        delivery === 'pickup'
          ? 'Самовивіз (Любар)'
          : `${form.city}, відділення №${form.branch}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          city,
          note: form.note,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка відправки');
      setDone(true);
      clear();
    } catch (err: any) {
      setError(err.message || 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="cart-empty">
        <span className="big-ico">✓</span>
        <h2>Замовлення прийнято!</h2>
        <p>Ми зв&apos;яжемося з вами найближчим часом для підтвердження.</p>
        <a className="btn-light-green" href="/">На головну</a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="big-ico">🛒</span>
        <h2>Кошик порожній</h2>
        <p>Додайте товари з каталогу, щоб оформити замовлення.</p>
        <a className="btn-light-green" href="/catalog/etransport">До каталогу</a>
      </div>
    );
  }

  return (
    <>
      <div className="section-head">
        <h2>Кошик</h2>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <span className="cart-row-img">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.title} />
                ) : (
                  <span className="cart-row-noimg">📦</span>
                )}
              </span>
              <div className="cart-row-info">
                <a href={i.kind === 'bundle' ? `/set/${i.slug}` : `/product/${i.slug}`} className="cart-row-title">{i.title}</a>
                {i.kind === 'bundle' && i.bundleItems && (
                  <ul className="cart-row-bundle">
                    {i.bundleItems.map((bi, j) => (
                      <li key={j}>{bi.title}</li>
                    ))}
                  </ul>
                )}
                <span className="cart-row-price">
                  {i.oldPrice && i.oldPrice > i.price && (
                    <span className="cart-row-old">{fmt(i.oldPrice)} ₴</span>
                  )}
                  {fmt(i.price)} ₴ {i.kind === 'bundle' ? '/ набір' : '/ шт'}
                </span>
              </div>
              <div className="cart-qty">
                <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Менше">−</button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Більше">+</button>
              </div>
              <span className="cart-row-sum">{fmt(i.price * i.qty)} ₴</span>
              <button className="cart-remove" onClick={() => remove(i.id)} aria-label="Видалити">✕</button>
            </div>
          ))}
        </div>

        <form className="cart-checkout" onSubmit={submit}>
          {savings > 0 && (
            <div className="cart-savings">
              <span>🎉 Ваша економія</span>
              <strong>{fmt(savings)} ₴</strong>
            </div>
          )}
          <div className="cart-total">
            <span>Разом:</span>
            <strong>{fmt(total)} ₴</strong>
          </div>

          <label className="cart-label">Спосіб доставки</label>
          <div className="cart-delivery">
            <button
              type="button"
              className={delivery === 'np' ? 'on' : ''}
              onClick={() => setDelivery('np')}
            >
              📦 Нова Пошта
            </button>
            <button
              type="button"
              className={delivery === 'pickup' ? 'on' : ''}
              onClick={() => setDelivery('pickup')}
            >
              🏪 Самовивіз
            </button>
          </div>

          <input
            required placeholder="Ваше ім'я та прізвище"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required type="tel" placeholder="+380 XX XXX XX XX"
            value={form.phone}
            onChange={(e) => {
              let v = e.target.value.replace(/[^\d+]/g, '');
              if (!v.startsWith('+380')) v = '+380' + v.replace(/^\+?380?/, '');
              setForm({ ...form, phone: v.slice(0, 13) });
            }}
          />

          {delivery === 'np' ? (
            <>
              <input
                required placeholder="Місто (напр. Київ)"
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                required placeholder="Номер відділення / поштомату"
                value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
            </>
          ) : (
            <p className="cart-pickup-note">
              Самовивіз з нашого магазину: вул. Житомирська, Любар, Житомирська обл.
            </p>
          )}

          <textarea
            placeholder="Коментар до замовлення (необов'язково)"
            value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="buy-btn" disabled={sending}>
            {sending ? 'Відправляємо…' : 'Оформити замовлення'}
          </button>
          <p className="cart-checkout-note">Менеджер зв&apos;яжеться для підтвердження</p>
        </form>
      </div>
    </>
  );
}
