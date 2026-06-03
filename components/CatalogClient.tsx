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
      params.delete('page'); // скидаємо на 1 сторінку при зміні фільтра
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  const brand = sp.get('brand') ?? '';
  const maxPrice = Number(sp.get('maxPrice')) || options.priceMax;
  const inStockOnly = sp.get('inStock') === '1';
  const sort = sp.get('sort') ?? 'featured';

  const reset = () => router.push(pathname);

  return (
    <aside className="filters">
      <div className="filter-group">
        <label>Бренд</label>
        <select value={brand} onChange={(e) => update('brand', e.target.value)}>
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
            defaultValue={maxPrice}
            onMouseUp={(e) => update('maxPrice', (e.target as HTMLInputElement).value)}
            onTouchEnd={(e) => update('maxPrice', (e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <div className="filter-group">
        <label>Сортування</label>
        <select value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="featured">Спочатку популярні</option>
          <option value="price-asc">Дешевші спочатку</option>
          <option value="price-desc">Дорожчі спочатку</option>
        </select>
      </div>

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
