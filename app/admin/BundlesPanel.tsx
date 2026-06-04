'use client';

import { useState, useEffect, useCallback } from 'react';

type Tier = { min: number; type: 'percent' | 'amount'; value: number };
type Bundle = {
  id: number; slug: string; title: string; description: string | null;
  emoji: string | null; product_ids: number[]; discount_tiers: Tier[]; published: boolean;
};
type Prod = { id: number; title: string; brand: string | null; price: number | null };

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);
const emptyBundle = (): Partial<Bundle> => ({
  title: '', slug: '', description: '', emoji: '📦', product_ids: [], discount_tiers: [], published: true,
});

export default function BundlesPanel({ headers }: { headers: () => HeadersInit }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<Bundle> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // вибрані товари (повні об'єкти для показу) у редакторі
  const [chosen, setChosen] = useState<Prod[]>([]);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<Prod[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bundles', { headers: headers() });
      const data = await res.json();
      setBundles(data.bundles ?? []);
    } catch { setBundles([]); }
    setLoading(false);
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  // відкрити редактор: підтягнути повні дані товарів набору
  const openEdit = async (b: Partial<Bundle>) => {
    setEdit({ ...b, discount_tiers: b.discount_tiers ?? [], product_ids: b.product_ids ?? [] });
    setError('');
    setSearch(''); setFound([]);
    if (b.product_ids?.length) {
      try {
        const res = await fetch(`/api/admin/products?ids=${b.product_ids.join(',')}`, { headers: headers() });
        const data = await res.json();
        setChosen(data.products ?? []);
      } catch {
        setChosen([]);
      }
    } else {
      setChosen([]);
    }
  };

  const doSearch = async () => {
    if (!search.trim()) { setFound([]); return; }
    const res = await fetch(`/api/admin/products?q=${encodeURIComponent(search)}&page=1`, { headers: headers() });
    const data = await res.json();
    setFound((data.products ?? []).slice(0, 12));
  };

  const addProduct = (p: Prod) => {
    if (chosen.find((c) => c.id === p.id)) return;
    setChosen((prev) => [...prev, p]);
  };
  const removeProduct = (id: number) => setChosen((prev) => prev.filter((c) => c.id !== id));

  // рівні знижки
  const addTier = () => setEdit((e) => e ? { ...e, discount_tiers: [...(e.discount_tiers ?? []), { min: 2, type: 'percent', value: 5 }] } : e);
  const updTier = (i: number, patch: Partial<Tier>) => setEdit((e) => {
    if (!e) return e;
    const t = [...(e.discount_tiers ?? [])];
    t[i] = { ...t[i], ...patch };
    return { ...e, discount_tiers: t };
  });
  const delTier = (i: number) => setEdit((e) => e ? { ...e, discount_tiers: (e.discount_tiers ?? []).filter((_, j) => j !== i) } : e);

  const save = async () => {
    if (!edit || !edit.title?.trim()) return;
    setSaving(true); setError('');
    try {
      const payload = { ...edit, product_ids: chosen.map((c) => c.id) };
      const method = edit.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/bundles', { method, headers: headers(), body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setEdit(null); load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm('Видалити набір?')) return;
    await fetch(`/api/admin/bundles?id=${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  // ── Редактор ──
  if (edit) {
    const subtotal = chosen.reduce((s, p) => s + (p.price ?? 0), 0);
    return (
      <div className="adm-editor">
        <div className="adm-editor-head">
          <h3>{edit.id ? 'Редагувати набір' : 'Новий набір'}</h3>
          <button className="adm-link" onClick={() => setEdit(null)}>← Назад</button>
        </div>

        <div className="adm-field-row">
          <label className="adm-field" style={{ maxWidth: 90 }}><span>Емодзі</span>
            <input value={edit.emoji ?? ''} maxLength={4} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} />
          </label>
          <label className="adm-field"><span>Назва набору</span>
            <input value={edit.title ?? ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Набір для миття авто" />
          </label>
        </div>
        <label className="adm-field"><span>URL (slug) — порожнім для авто</span>
          <input value={edit.slug ?? ''} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} placeholder="nabir-dlya-myttya" />
        </label>
        <label className="adm-field"><span>Опис набору</span>
          <textarea rows={2} value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
        </label>

        <div className="adm-field">
          <span>Товари набору ({chosen.length})</span>
          <div className="bnd-chosen">
            {chosen.map((p) => (
              <div className="bnd-chosen-item" key={p.id}>
                <span>{p.title}</span>
                <span className="bnd-price">{p.price ? `${fmt(p.price)} ₴` : '—'}</span>
                <button onClick={() => removeProduct(p.id)}>✕</button>
              </div>
            ))}
            {chosen.length === 0 && <p className="adm-muted" style={{ padding: '6px 0' }}>Ще не додано товарів</p>}
          </div>
          {chosen.length > 0 && <div className="bnd-subtotal">Сума без знижки: <b>{fmt(subtotal)} ₴</b></div>}
        </div>

        <div className="adm-field">
          <span>Додати товар (пошук за назвою)</span>
          <div className="bnd-search">
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="Напр. шампунь…" />
            <button className="adm-btn-ghost" onClick={doSearch}>Знайти</button>
          </div>
          {found.length > 0 && (
            <div className="bnd-found">
              {found.map((p) => (
                <div className="bnd-found-item" key={p.id} onClick={() => addProduct(p)}>
                  <span>{p.title}</span>
                  <span className="bnd-price">{p.price ? `${fmt(p.price)} ₴` : '—'} +</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-field">
          <span>Рівні знижки (за кількістю товарів)</span>
          <div className="bnd-tiers">
            {(edit.discount_tiers ?? []).map((t, i) => (
              <div className="bnd-tier" key={i}>
                <span>від</span>
                <input type="number" min={1} value={t.min} onChange={(e) => updTier(i, { min: Number(e.target.value) })} style={{ width: 60 }} />
                <span>шт →</span>
                <select value={t.type} onChange={(e) => updTier(i, { type: e.target.value as Tier['type'] })}>
                  <option value="percent">знижка %</option>
                  <option value="amount">знижка ₴</option>
                </select>
                <input type="number" min={0} value={t.value} onChange={(e) => updTier(i, { value: Number(e.target.value) })} style={{ width: 80 }} />
                <button className="adm-link adm-danger" onClick={() => delTier(i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="adm-btn-ghost" style={{ marginTop: 8 }} onClick={addTier}>+ Додати рівень</button>
        </div>

        <label className="adm-check">
          <input type="checkbox" checked={edit.published !== false} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} />
          Опубліковано (видно на сайті)
        </label>

        {error && <p className="admin-err">{error}</p>}
        <div className="adm-editor-actions">
          <button className="adm-btn-primary" onClick={save} disabled={saving || !edit.title?.trim()}>{saving ? 'Збереження…' : 'Зберегти набір'}</button>
          <button className="adm-btn-ghost" onClick={() => setEdit(null)}>Скасувати</button>
        </div>
      </div>
    );
  }

  // ── Список ──
  return (
    <div>
      <div className="adm-bar">
        <button className="adm-btn-primary" onClick={() => openEdit(emptyBundle())}>+ Новий набір</button>
        <button className="adm-refresh" onClick={load}>↻ Оновити</button>
      </div>
      {loading ? (
        <p className="adm-muted">Завантаження…</p>
      ) : bundles.length === 0 ? (
        <p className="adm-muted">Наборів ще немає. Створіть перший!</p>
      ) : (
        <div className="adm-articles">
          {bundles.map((b) => (
            <div className="adm-article" key={b.id}>
              <span className="adm-article-emoji">{b.emoji}</span>
              <div className="adm-article-info">
                <strong>{b.title}</strong>
                <span className="adm-article-slug">/set/{b.slug} · {b.product_ids?.length ?? 0} товарів · {(b.discount_tiers?.length ?? 0)} рівнів знижки {!b.published && '· чернетка'}</span>
              </div>
              <div className="adm-article-actions">
                <button className="adm-link" onClick={() => openEdit(b)}>Редагувати</button>
                <button className="adm-link adm-danger" onClick={() => remove(b.id)}>Видалити</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
