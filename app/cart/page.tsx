'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

export default function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', city: '', note: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
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
        <p>Ми зв'яжемося з вами найближчим часом для підтвердження.</p>
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
              <div className="cart-row-info">
                <a href={`/product/${i.slug}`} className="cart-row-title">{i.title}</a>
                <span className="cart-row-price">{fmt(i.price)} ₴ / шт</span>
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
          <div className="cart-total">
            <span>Разом:</span>
            <strong>{fmt(total)} ₴</strong>
          </div>
          <input
            required placeholder="Ваше ім'я"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required type="tel" placeholder="Телефон"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required placeholder="Місто та відділення"
            value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <textarea
            placeholder="Коментар до замовлення (необов'язково)"
            value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="buy-btn" disabled={sending}>
            {sending ? 'Відправляємо…' : 'Оформити замовлення'}
          </button>
        </form>
      </div>
    </>
  );
}
