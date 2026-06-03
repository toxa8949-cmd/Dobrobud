'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function CatalogSort({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const sort = sp.get('sort') ?? 'featured';

  const change = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== 'featured') params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="catalog-sort">
      <span className="cs-count">{new Intl.NumberFormat('uk-UA').format(total)} товарів</span>
      <div className="cs-right">
        <span className="cs-label">Сортувати:</span>
        <select value={sort} onChange={(e) => change(e.target.value)}>
          <option value="featured">Спочатку популярні</option>
          <option value="price-asc">Дешевші спочатку</option>
          <option value="price-desc">Дорожчі спочатку</option>
        </select>
      </div>
    </div>
  );
}
