'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

// Структура каталогу для випадайки
const CATALOG = [
  {
    title: 'Транспорт',
    type: 'etransport',
    items: [
      'Електроскутери', 'Електровелосипеди', 'Електросамокати',
      'Електротрицикли', 'Велосипеди', 'Дитячі велосипеди',
    ],
  },
  {
    title: 'Автохімія',
    type: 'chemistry',
    items: [
      'Моторні оливи', 'Автомобільні емалі', 'AdBlue',
      'Ароматизатори', 'Антикорозійні засоби та покриття',
    ],
  },
  {
    title: 'Інструмент',
    type: 'tools',
    items: [],
  },
];

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const catUrl = (type: string, sub?: string) =>
    `/catalog/${type}${sub ? `?sub=${encodeURIComponent(sub)}` : ''}`;

  return (
    <header className="site-header">
      <a href="/" className="logo">
        <span className="logo-mark">⚡</span>
        <span>Добробуд</span>
      </a>

      <nav className="header-nav">
        <div
          className="nav-catalog"
          onMouseEnter={() => setCatOpen(true)}
          onMouseLeave={() => setCatOpen(false)}
        >
          <a className="nav-catalog-btn" href="/catalog">Каталог ▾</a>
          {catOpen && (
            <div className="mega">
              {CATALOG.map((col) => (
                <div className="mega-col" key={col.type}>
                  <a className="mega-title" href={`/catalog/${col.type}`}>{col.title}</a>
                  {col.items.map((it) => (
                    <a className="mega-link" key={it} href={catUrl(col.type, it)}>{it}</a>
                  ))}
                  {col.items.length === 0 && <span className="mega-soon">Скоро</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <a href="/tiktok" className="nav-tiktok">TikTok 🔥</a>
        <a href="/delivery">Доставка</a>
        <a href="/about">Про нас</a>
        <a href="/blog">Блог</a>
      </nav>

      <form action="/search" className="search">
        <input name="q" placeholder="Пошук товарів…" />
      </form>

      <a href="/cart" className="cart-link" aria-label="Кошик">
        <span className="cart-ico">🛒</span>
        {count > 0 && <span className="cart-count">{count}</span>}
      </a>
      <button className="burger" aria-label="Меню" onClick={() => setMenuOpen((v) => !v)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          {CATALOG.map((col) => (
            <details className="mm-group" key={col.type}>
              <summary>{col.title}</summary>
              <a href={`/catalog/${col.type}`} onClick={() => setMenuOpen(false)}>Усі товари</a>
              {col.items.map((it) => (
                <a key={it} href={catUrl(col.type, it)} onClick={() => setMenuOpen(false)}>{it}</a>
              ))}
            </details>
          ))}
          <a href="/delivery" onClick={() => setMenuOpen(false)}>Доставка</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>Про нас</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>Блог</a>
          <a href="/tiktok" className="mm-tiktok" onClick={() => setMenuOpen(false)}>TikTok 🔥</a>
        </div>
      )}
    </header>
  );
}
