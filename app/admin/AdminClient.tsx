'use client';

import { useState, useCallback } from 'react';

interface AdminProduct {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  category_type: string;
  brand?: string | null;
  price: number | null;
  specs: Record<string, any>;
}

const TYPES = [
  { value: '', label: 'Усі категорії' },
  { value: 'etransport', label: 'Електротранспорт' },
  { value: 'chemistry', label: 'Автохімія' },
  { value: 'tools', label: 'Інструмент' },
];

export default function AdminClient() {
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // статус генерації по id
  const [genStatus, setGenStatus] = useState<Record<number, 'idle' | 'gen' | 'saved' | 'err'>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-admin-password': pass }),
    [pass]
  );

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (type) params.set('type', type);
        if (q) params.set('q', q);
        if (onlyEmpty) params.set('onlyEmpty', '1');
        const res = await fetch(`/api/admin/products?${params}`, { headers: headers() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Помилка завантаження');
        setProducts(data.products);
        setTotal(data.total);
        setPage(data.page);
        setAuthed(true);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [type, q, onlyEmpty, headers]
  );

  // згенерувати опис для одного товару (і одразу зберегти)
  const generateOne = useCallback(
    async (p: AdminProduct): Promise<boolean> => {
      setGenStatus((s) => ({ ...s, [p.id]: 'gen' }));
      try {
        const gen = await fetch('/api/admin/generate', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ title: p.title, specs: p.specs, rawDescription: p.description }),
        });
        const gd = await gen.json();
        if (!gen.ok) throw new Error(gd.error);

        const save = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify({ id: p.id, description: gd.description }),
        });
        if (!save.ok) {
          const sd = await save.json();
          throw new Error(sd.error);
        }
        setProducts((list) =>
          list.map((x) => (x.id === p.id ? { ...x, description: gd.description } : x))
        );
        setGenStatus((s) => ({ ...s, [p.id]: 'saved' }));
        return true;
      } catch (e: any) {
        setGenStatus((s) => ({ ...s, [p.id]: 'err' }));
        setError(`${p.title}: ${e.message}`);
        return false;
      }
    },
    [headers]
  );

  // пакетна генерація для всіх товарів поточної сторінки
  const generateBatch = useCallback(async () => {
    if (batchRunning) return;
    const targets = products.filter((p) => !p.description);
    if (targets.length === 0) {
      setError('На цій сторінці немає товарів без опису');
      return;
    }
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      await generateOne(targets[i]);
      setBatchProgress({ done: i + 1, total: targets.length });
      // невелика пауза щоб не впертись у rate limit
      await new Promise((r) => setTimeout(r, 400));
    }
    setBatchRunning(false);
  }, [products, generateOne, batchRunning]);

  const totalPages = Math.ceil(total / 50);

  if (!authed) {
    return (
      <div className="admin-login">
        <h1>Адмін-панель</h1>
        <p>Введіть пароль для доступу</p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
          placeholder="Пароль"
        />
        <button onClick={() => load(1)} disabled={loading}>
          {loading ? 'Перевірка…' : 'Увійти'}
        </button>
        {error && <p className="admin-err">{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Товари · описи</h1>
        <span className="admin-count">{total} товарів</span>
      </div>

      <div className="admin-toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1)}
          placeholder="Пошук за назвою…"
        />
        <label className="admin-check">
          <input type="checkbox" checked={onlyEmpty} onChange={(e) => setOnlyEmpty(e.target.checked)} />
          Лише без опису
        </label>
        <button onClick={() => load(1)} disabled={loading}>Застосувати</button>
        <button
          className="admin-batch"
          onClick={generateBatch}
          disabled={batchRunning || loading}
        >
          {batchRunning
            ? `Генерую… ${batchProgress.done}/${batchProgress.total}`
            : '✨ Згенерувати для сторінки'}
        </button>
      </div>

      {error && <p className="admin-err">{error}</p>}

      <div className="admin-list">
        {products.map((p) => {
          const st = genStatus[p.id] || 'idle';
          return (
            <div key={p.id} className="admin-row">
              <div className="admin-row-main">
                <div className="admin-row-title">{p.title}</div>
                <div className="admin-row-meta">
                  {p.brand && <span>{p.brand}</span>}
                  <span>{p.price ? `${p.price} ₴` : 'без ціни'}</span>
                  {p.description ? (
                    <span className="admin-has-desc">опис є ({p.description.length})</span>
                  ) : (
                    <span className="admin-no-desc">без опису</span>
                  )}
                </div>
                {p.description && <div className="admin-row-desc">{p.description}</div>}
              </div>
              <button
                className="admin-gen-btn"
                onClick={() => generateOne(p)}
                disabled={st === 'gen' || batchRunning}
              >
                {st === 'gen' ? '…' : st === 'saved' ? '✓' : p.description ? 'Перегенерувати' : 'Згенерувати'}
              </button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="admin-pager">
          <button onClick={() => load(page - 1)} disabled={page <= 1 || loading}>← Назад</button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => load(page + 1)} disabled={page >= totalPages || loading}>Далі →</button>
        </div>
      )}
    </div>
  );
}
