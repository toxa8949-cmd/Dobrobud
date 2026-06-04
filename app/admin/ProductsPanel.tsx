'use client';

import { useState, useCallback, useEffect } from 'react';

interface AdminProduct {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  category_type: string;
  brand?: string | null;
  price: number | null;
  specs: Record<string, any>;
  is_tiktok?: boolean;
}

const TYPES = [
  { value: '', label: 'Усі категорії' },
  { value: 'etransport', label: 'Транспорт' },
  { value: 'chemistry', label: 'Автохімія' },
  { value: 'tools', label: 'Інструмент' },
];

export default function ProductsPanel({ headers }: { headers: () => HeadersInit }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [onlyTiktok, setOnlyTiktok] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [genStatus, setGenStatus] = useState<Record<number, 'idle' | 'gen' | 'saved' | 'err'>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (type) params.set('type', type);
        if (q) params.set('q', q);
        if (onlyEmpty) params.set('onlyEmpty', '1');
        if (onlyTiktok) params.set('onlyTiktok', '1');
        const res = await fetch(`/api/admin/products?${params}`, { headers: headers() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Помилка завантаження');
        setProducts(data.products);
        setTotal(data.total);
        setPage(data.page);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [type, q, onlyEmpty, onlyTiktok, headers]
  );

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        if (!save.ok) { const sd = await save.json(); throw new Error(sd.error); }
        setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, description: gd.description } : x)));
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

  const toggleTikTok = useCallback(
    async (p: AdminProduct) => {
      const next = !p.is_tiktok;
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, is_tiktok: next } : x)));
      try {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH', headers: headers(),
          body: JSON.stringify({ id: p.id, is_tiktok: next }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      } catch (e: any) {
        setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, is_tiktok: !next } : x)));
        setError(`${p.title}: ${e.message}`);
      }
    },
    [headers]
  );

  const generateBatch = useCallback(async () => {
    if (batchRunning) return;
    const targets = products.filter((p) => !p.description);
    if (targets.length === 0) { setError('На цій сторінці немає товарів без опису'); return; }
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      await generateOne(targets[i]);
      setBatchProgress({ done: i + 1, total: targets.length });
      await new Promise((r) => setTimeout(r, 400));
    }
    setBatchRunning(false);
  }, [products, generateOne, batchRunning]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="admin-toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="Пошук за назвою…" />
        <label className="admin-check"><input type="checkbox" checked={onlyEmpty} onChange={(e) => setOnlyEmpty(e.target.checked)} /> Лише без опису</label>
        <label className="admin-check"><input type="checkbox" checked={onlyTiktok} onChange={(e) => setOnlyTiktok(e.target.checked)} /> Лише TikTok</label>
        <button onClick={() => load(1)} disabled={loading}>Застосувати</button>
        <button className="admin-batch" onClick={generateBatch} disabled={batchRunning || loading}>
          {batchRunning ? `Генерую… ${batchProgress.done}/${batchProgress.total}` : '✨ Згенерувати для сторінки'}
        </button>
      </div>

      <span className="admin-count">{total} товарів</span>
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
                  {p.description ? <span className="admin-has-desc">опис є ({p.description.length})</span> : <span className="admin-no-desc">без опису</span>}
                  {p.is_tiktok && <span className="admin-tiktok-badge">TikTok</span>}
                </div>
                {p.description && <div className="admin-row-desc">{p.description}</div>}
              </div>
              <div className="admin-row-actions">
                <button className={`admin-tiktok-btn ${p.is_tiktok ? 'on' : ''}`} onClick={() => toggleTikTok(p)}>
                  {p.is_tiktok ? '✓ У TikTok' : '+ TikTok'}
                </button>
                <button className="admin-gen-btn" onClick={() => generateOne(p)} disabled={st === 'gen' || batchRunning}>
                  {st === 'gen' ? '…' : st === 'saved' ? '✓' : p.description ? 'Перегенерувати' : 'Згенерувати'}
                </button>
              </div>
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
