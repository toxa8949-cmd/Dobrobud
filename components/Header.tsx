'use client';

import { useCart } from '@/lib/cart';

export default function Header() {
  const { count } = useCart();

  return (
    <header className="site-header">
      <a href="/" className="logo">
        <span className="logo-mark">⚡</span>
        <span>Добробуд</span>
      </a>
      <form action="/search" className="search">
        <input name="q" placeholder="Самокати, велосипеди, хімія, інструмент…" />
      </form>
      <nav className="header-nav">
        <a href="/catalog/etransport">Електротранспорт</a>
        <a href="/catalog/chemistry">Автохімія</a>
        <a href="/catalog/tools">Інструмент</a>
        <a href="/tiktok" className="nav-tiktok">TikTok 🔥</a>
      </nav>
      <a href="/cart" className="cart-link" aria-label="Кошик">
        <span className="cart-ico">🛒</span>
        {count > 0 && <span className="cart-count">{count}</span>}
      </a>
    </header>
  );
}
