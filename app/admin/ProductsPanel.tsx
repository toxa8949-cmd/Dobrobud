'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUpload from './ImageUpload';

interface AdminProduct {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  category_type: string;
  brand?: string | null;
  price: number | null;
  old_price?: number | null;
  in_stock: boolean;
  images: string[];
  specs: Record<string, any>;
  is_tiktok?: boolean;
  is_featured?: boolean;
}

const TYPES = [
  { value: 'etransport', label: 'Транспорт' },
  { value: 'chemistry', label: 'Автохімія' },
  { value: 'tools', label: 'Інструмент' },
];
const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;
const fmt = (n: number | null) => (n == null ? '—' : new Intl.NumberFormat('uk-UA').format(n));

const emptyProduct = (): Partial<AdminProduct> => ({
  title: '', brand: '', price: null, old_price: null, category_type: 'etransport',
  in_stock: true, description: '', images: [], is_tiktok: false, is_featured: false,
});

export default function ProductsPanel({ headers }: { headers: () => HeadersInit }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [sort, setSort] = useState('new');
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<Partial<AdminProduct> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(p), sort });
        if (type) params.set('type', type);
        if (q) params.set('q', q);
        if (brand) params.set('brand', brand);
        if (stock) params.set('stock', stock);
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
    [type, q, brand, stock, sort, headers]
  );

  const loadBrands = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/brands${type ? `?type=${type}` : ''}`, { headers: headers() });
      const data = await res.json();
      setBrands(data.brands ?? []);
    } catch { setBrands([]); }
  }, [type, headers]);

  useEffect(() => { load(1); loadBrands(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [type, brand, stock, sort]);
  useEffect(() => { loadBrands(); setBrand(''); /* eslint-disable-next-line */ }, [type]);

  const save = async () => {
    if (!edit || !edit.title?.trim()) return;
    setSaving(true);
    setError('');
    try {
      const method = edit.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/products', { method, headers: headers(), body: JSON.stringify(edit) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setEdit(null);
      load(page);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Видалити «${p.title}»?`)) return;
    await fetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE', headers: headers() });
    load(page);
  };

  const totalPages = Math.ceil(total / 30);

  // ── Редактор товару ──
  if (edit) {
    const imgStr = (edit.images ?? []).join('\n');
    return (
      <div className="adm-editor">
        <div className="adm-editor-head">
          <h3>{edit.id ? 'Редагувати товар' : 'Новий товар'}</h3>
          <button className="adm-link" onClick={() => setEdit(null)}>← Назад до списку</button>
        </div>
        <label className="adm-field"><span>Назва</span>
          <input value={edit.title ?? ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
        </label>
        <div className="adm-field-row">
          <label className="adm-field"><span>Ціна, ₴</span>
            <input type="number" value={edit.price ?? ''} onChange={(e) => setEdit({ ...edit, price: e.target.value === '' ? null : Number(e.target.value) })} />
          </label>
          <label className="adm-field"><span>Стара ціна, ₴ (необов’язково)</span>
            <input type="number" value={edit.old_price ?? ''} onChange={(e) => setEdit({ ...edit, old_price: e.target.value === '' ? null : Number(e.target.value) })} />
          </label>
        </div>
        <div className="adm-field-row">
          <label className="adm-field"><span>Бренд</span>
            <input value={edit.brand ?? ''} onChange={(e) => setEdit({ ...edit, brand: e.target.value })} />
          </label>
          <label className="adm-field"><span>Категорія</span>
            <select value={edit.category_type} onChange={(e) => setEdit({ ...edit, category_type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
        </div>
        <label className="adm-field"><span>Опис</span>
          <textarea rows={6} value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
        </label>
        <label className="adm-field"><span>Фото товару</span>
          <ImageUpload images={edit.images ?? []} onChange={(next) => setEdit({ ...edit, images: next })} headers={headers} multiple />
        </label>
        <label className="adm-field"><span>…або вставте URL (по одному на рядок)</span>
          <textarea rows={2} value={imgStr} onChange={(e) => setEdit({ ...edit, images: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} placeholder="https://..." />
        </label>
        <div className="adm-checks-row">
          <label className="adm-check"><input type="checkbox" checked={!!edit.in_stock} onChange={(e) => setEdit({ ...edit, in_stock: e.target.checked })} /> В наявності</label>
          <label className="adm-check"><input type="checkbox" checked={!!edit.is_tiktok} onChange={(e) => setEdit({ ...edit, is_tiktok: e.target.checked })} /> Показувати в TikTok</label>
          <label className="adm-check"><input type="checkbox" checked={!!edit.is_featured} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} /> Рекомендований</label>
        </div>
        {error && <p className="admin-err">{error}</p>}
        <div className="adm-editor-actions">
          <button className="adm-btn-primary" onClick={save} disabled={saving || !edit.title?.trim()}>{saving ? 'Збереження…' : 'Зберегти'}</button>
          <button className="adm-btn-ghost" onClick={() => setEdit(null)}>Скасувати</button>
        </div>
      </div>
    );
  }

  // ── Список товарів ──
  return (
    <div>
      <div className="adm-prod-top">
        <div className="adm-prod-filters">
          <input className="adm-search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(1)} placeholder="🔍 Пошук за назвою…" />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Усі категорії</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Усі бренди</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={stock} onChange={(e) => setStock(e.target.value)}>
            <option value="">Будь-яка наявність</option>
            <option value="in">В наявності</option>
            <option value="out">Немає</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Спочатку нові</option>
            <option value="old">Спочатку старі</option>
            <option value="price-asc">Дешевші</option>
            <option value="price-desc">Дорожчі</option>
            <option value="name">За назвою</option>
          </select>
        </div>
        <button className="adm-add-btn" onClick={() => setEdit(emptyProduct())}>+ Додати товар</button>
      </div>

      <div className="adm-prod-count">Знайдено: {total}</div>
      {error && <p className="admin-err">{error}</p>}

      <div className="adm-prod-table">
        <div className="adm-prod-row adm-prod-header">
          <span>Назва</span><span>Категорія</span><span>Бренд</span><span>Ціна</span><span>Статус</span><span></span>
        </div>
        {loading ? (
          <p className="adm-muted">Завантаження…</p>
        ) : products.map((p) => (
          <div className="adm-prod-row" key={p.id}>
            <div className="adm-prod-name">
              <strong>{p.title}</strong>
              <span className="adm-prod-slug">/{p.slug}</span>
              <span className="adm-prod-badges">
                {p.is_tiktok && <em className="b-tiktok">TikTok</em>}
                {p.is_featured && <em className="b-feat">Рекоменд.</em>}
                {(!p.images || p.images.length === 0) && <em className="b-nophoto">без фото</em>}
              </span>
            </div>
            <span className="adm-prod-cell">{typeLabel(p.category_type)}</span>
            <span className="adm-prod-cell">{p.brand || '—'}</span>
            <span className="adm-prod-cell adm-prod-price">{fmt(p.price)} ₴</span>
            <span className="adm-prod-cell">
              <em className={p.in_stock ? 'st-in' : 'st-out'}>{p.in_stock ? '● В наявності' : '○ Немає'}</em>
            </span>
            <span className="adm-prod-cell adm-prod-acts">
              <button onClick={() => setEdit({ ...p })} title="Редагувати">✏️</button>
              <button onClick={() => remove(p)} title="Видалити">🗑️</button>
            </span>
          </div>
        ))}
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
