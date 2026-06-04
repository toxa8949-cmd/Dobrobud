'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { FilterOptions } from '@/lib/supabase';

export default function CatalogFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  const brand = sp.get('brand') ?? '';
  const sub = sp.get('sub') ?? '';
  const size = sp.get('size') ?? '';
  const maxPrice = Number(sp.get('maxPrice')) || options.priceMax;
  const inStockOnly = sp.get('inStock') === '1';

  const reset = () => router.push(pathname);
  const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

  // Поточний розділ із шляху (/catalog/etransport → etransport)
  const currentType = pathname.split('/')[2] ?? '';
  const SECTIONS = [
    { type: 'etransport', label: '🚲 Транспорт' },
    { type: 'chemistry', label: '🧴 Автохімія' },
    { type: 'tools', label: '🔧 Інструмент' },
  ];

  return (
    <aside className="filters">
      <div className="filter-group">
        <label>Розділи</label>
        <ul className="filter-sections">
          {SECTIONS.map((s) => (
            <li key={s.type}>
              <a
                className={currentType === s.type ? 'active' : ''}
                href={`/catalog/${s.type}`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {options.subcatCounts.length > 0 && (
        <div className="filter-group">
          <label>Категорії</label>
          <ul className="filter-cats">
            <li>
              <button className={!sub ? 'active' : ''} onClick={() => update('sub', '')}>
                <span>Усі товари</span>
              </button>
            </li>
            {options.subcatCounts.map((c) => (
              <li key={c.name}>
                <button className={sub === c.name ? 'active' : ''} onClick={() => update('sub', c.name)}>
                  <span>{c.name}</span>
                  <span className="fc-count">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filter-group">
        <label>Бренд</label>
        <select value={brand} onChange={(e) => update('brand', e.target.value)}>
          <option value="">Усі бренди</option>
          {options.brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {options.sizeCounts && options.sizeCounts.length > 0 && (
        <div className="filter-group">
          <label>Розмір колеса</label>
          <div className="filter-sizes">
            {options.sizeCounts.map((s) => (
              <button
                key={s.name}
                className={`size-chip ${size === s.name ? 'active' : ''}`}
                onClick={() => update('size', size === s.name ? '' : s.name)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {options.priceMax > 0 && (
        <div className="filter-group">
          <label>Ціна до: {fmt(maxPrice)} ₴</label>
          <input
            type="range"
            min={options.priceMin}
            max={options.priceMax}
            step={Math.max(1, Math.round((options.priceMax - options.priceMin) / 100))}
            defaultValue={maxPrice}
            onMouseUp={(e) => update('maxPrice', (e.target as HTMLInputElement).value)}
            onTouchEnd={(e) => update('maxPrice', (e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => update('inStock', e.target.checked ? '1' : '')}
        />
        Тільки в наявності
      </label>

      <button className="reset-btn" onClick={reset}>Скинути фільтри</button>
    </aside>
  );
}
