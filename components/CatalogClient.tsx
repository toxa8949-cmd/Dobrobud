'use client';

import { useMemo, useState } from 'react';
import type { Product, CategoryType, FilterOptions } from '@/lib/supabase';
import CatalogGrid from './CatalogGrid';

type Sort = 'featured' | 'price-asc' | 'price-desc';

// Специфічні фільтри під кожен тип категорії
const SPEC_FILTERS: Record<CategoryType, { key: string; label: string; unit: string }[]> = {
  etransport: [
    { key: 'speed_kmh', label: 'Швидкість від', unit: 'км/год' },
    { key: 'range_km', label: 'Запас ходу від', unit: 'км' },
  ],
  chemistry: [{ key: 'volume_ml', label: 'Об\'єм від', unit: 'мл' }],
  tools: [{ key: 'power_w', label: 'Потужність від', unit: 'Вт' }],
};

export default function CatalogClient({
  products,
  type,
  options,
}: {
  products: Product[];
  type: CategoryType;
  options: FilterOptions;
}) {
  const [brand, setBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(options.priceMax);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [specMins, setSpecMins] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<Sort>('featured');

  const specFilters = SPEC_FILTERS[type];

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (brand && p.brand !== brand) return false;
      if (maxPrice && (p.price ?? 0) > maxPrice) return false;
      if (inStockOnly && !p.in_stock) return false;
      for (const f of specFilters) {
        const min = specMins[f.key];
        if (min && Number(p.specs[f.key] ?? 0) < min) return false;
      }
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else list = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return list;
  }, [products, brand, maxPrice, inStockOnly, specMins, sort, specFilters]);

  const reset = () => {
    setBrand('');
    setMaxPrice(options.priceMax);
    setInStockOnly(false);
    setSpecMins({});
  };

  return (
    <div className="catalog-layout">
      <aside className="filters">
        <div className="filter-group">
          <label>Бренд</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Усі бренди</option>
            {options.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {options.priceMax > 0 && (
          <div className="filter-group">
            <label>Ціна до: {new Intl.NumberFormat('uk-UA').format(maxPrice)} ₴</label>
            <input
              type="range"
              min={options.priceMin}
              max={options.priceMax}
              step={Math.max(1, Math.round((options.priceMax - options.priceMin) / 100))}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        )}

        {specFilters.map((f) => (
          <div className="filter-group" key={f.key}>
            <label>{f.label} ({f.unit})</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={specMins[f.key] ?? ''}
              onChange={(e) =>
                setSpecMins((s) => ({ ...s, [f.key]: Number(e.target.value) }))
              }
            />
          </div>
        ))}

        <label className="checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          Тільки в наявності
        </label>

        <button className="reset-btn" onClick={reset}>Скинути фільтри</button>
      </aside>

      <div className="catalog-main">
        <div className="catalog-toolbar">
          <span className="count">{filtered.length} товарів</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Спочатку популярні</option>
            <option value="price-asc">Дешевші спочатку</option>
            <option value="price-desc">Дорожчі спочатку</option>
          </select>
        </div>
        <CatalogGrid products={filtered} />
      </div>
    </div>
  );
}
