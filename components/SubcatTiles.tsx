'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const ICONS: Record<string, string> = {
  'Моторні оливи': '🛢️',
  'Трансмісійні оливи': '⚙️',
  'Спеціалізовані оливи': '🛢️',
  'Мастила': '🧴',
  'Автомобільні емалі': '🎨',
  'Універсальні емалі': '🎨',
  'Ароматизатори': '🌸',
  'Присадки': '💧',
  'Очисники кузова': '🚿',
  'Очисники салону': '🧽',
  'Охолоджуючі рідини': '❄️',
  'Поліролі кузова': '✨',
  'Поліролі торпедо': '✨',
  'Антикорозійні засоби та покриття': '🛡️',
  'Побутова хімія': '🧹',
  'Герметики, клеї, фіксатори': '🔩',
  'Розчинники': '⚗️',
  'Ґрунти': '🪣',
  'Зимові омивачі скла': '🪟',
  'Літні омивачі скла': '🪟',
  'Шпаклівки': '🪮',
  'Лаки': '💎',
  'Гальмівні рідини': '🛑',
  'AdBlue': '🔵',
  'Набори': '📦',
  'Матеріали для підготовки та фарбування': '🖌️',
};

export default function SubcatTiles({
  items,
}: {
  items: { name: string; count: number }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const active = sp.get('sub') ?? '';

  const pick = (name: string) => {
    const params = new URLSearchParams(sp.toString());
    if (name && name !== active) params.set('sub', name);
    else params.delete('sub');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="subcat-tiles">
      {items.map((it) => (
        <button
          key={it.name}
          className={`subcat-tile ${active === it.name ? 'active' : ''}`}
          onClick={() => pick(it.name)}
        >
          <span className="subcat-ico">{ICONS[it.name] ?? '🔧'}</span>
          <span className="subcat-name">{it.name}</span>
          <span className="subcat-count">{it.count}</span>
        </button>
      ))}
    </div>
  );
}
