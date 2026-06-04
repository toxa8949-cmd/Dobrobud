'use client';

import { useState, useCallback } from 'react';
import DashboardPanel from './DashboardPanel';
import OrdersPanel from './OrdersPanel';
import ProductsPanel from './ProductsPanel';
import BlogPanel from './BlogPanel';

type Tab = 'dashboard' | 'orders' | 'products' | 'blog';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: '📊' },
  { key: 'orders', label: 'Замовлення', icon: '📦' },
  { key: 'products', label: 'Товари', icon: '🛒' },
  { key: 'blog', label: 'Блог', icon: '📝' },
];

export default function AdminClient() {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');

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
    <div className="admin">
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="admin-panel">
        {tab === 'dashboard' && <DashboardPanel headers={headers} />}
        {tab === 'orders' && <OrdersPanel headers={headers} />}
        {tab === 'products' && <ProductsPanel headers={headers} />}
        {tab === 'blog' && <BlogPanel headers={headers} />}
      </div>
    </div>
  );
}
