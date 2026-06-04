'use client';

import { useState, useCallback } from 'react';
import DashboardPanel from './DashboardPanel';
import OrdersPanel from './OrdersPanel';
import ProductsPanel from './ProductsPanel';
import BlogPanel from './BlogPanel';

type Tab = 'dashboard' | 'products' | 'orders' | 'blog';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: '▦' },
  { key: 'products', label: 'Товари', icon: '📦' },
  { key: 'orders', label: 'Замовлення', icon: '🛍️' },
  { key: 'blog', label: 'Блог', icon: '📄' },
];

const TITLES: Record<Tab, string> = {
  dashboard: 'Дашборд',
  products: 'Товари',
  orders: 'Замовлення',
  blog: 'Блог',
};

export default function AdminClient() {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [navOpen, setNavOpen] = useState(false);

  const headers = useCallback(
    (): HeadersInit => ({ 'Content-Type': 'application/json', 'x-admin-login': login, 'x-admin-password': pass }),
    [login, pass]
  );

  const signIn = useCallback(async () => {
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', { headers: headers() });
      if (res.status === 401) throw new Error('Невірний логін або пароль');
      setAuthed(true);
    } catch (e: any) {
      setError(e.message || 'Помилка входу');
    } finally {
      setChecking(false);
    }
  }, [headers]);

  if (!authed) {
    return (
      <div className="admin-login">
        <h1>Адмін-панель</h1>
        <p>Введіть логін і пароль для доступу</p>
        <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && signIn()} placeholder="Логін" autoComplete="username" />
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && signIn()} placeholder="Пароль" autoComplete="current-password" />
        <button onClick={signIn} disabled={checking}>{checking ? 'Перевірка…' : 'Увійти'}</button>
        {error && <p className="admin-err">{error}</p>}
      </div>
    );
  }

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar ${navOpen ? 'open' : ''}`}>
        <div className="adm-brand">
          <span className="adm-brand-mark">⚡</span>
          <div><strong>Добробуд</strong><span>Адмінпанель</span></div>
        </div>
        <nav className="adm-nav">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => { setTab(t.key); setNavOpen(false); }}>
              <span className="adm-nav-ico">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <a href="/" className="adm-back-site">← На сайт</a>
      </aside>

      <main className="adm-main">
        <div className="adm-main-head">
          <button className="adm-burger" onClick={() => setNavOpen((v) => !v)}>☰</button>
          <h1>{TITLES[tab]}</h1>
        </div>
        <div className="adm-content">
          {tab === 'dashboard' && <DashboardPanel headers={headers} />}
          {tab === 'products' && <ProductsPanel headers={headers} />}
          {tab === 'orders' && <OrdersPanel headers={headers} />}
          {tab === 'blog' && <BlogPanel headers={headers} />}
        </div>
      </main>
    </div>
  );
}
