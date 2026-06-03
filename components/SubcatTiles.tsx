'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const ICONS: Record<string, string> = {
  // Електротранспорт
  'Електроскутери': '🛵',
  'Електросамокати': '🛴',
  'Електровелосипеди': '🚲',
  'Електротрицикли': '🛺',
  'Дитячий електротранспорт': '🧒',
  'Міські велосипеди': '🚲',
  'Велобіги': '🚲',
  '3-ох колісні': '🚲',
  'Велосипеди 12': '🚲',
  'Велосипеди 14': '🚲',
  'Велосипеди 16': '🚲',
  'Велосипеди 18': '🚲',
  'Велосипеди 20': '🚲',
  'Велосипеди 24': '🚲',
  'Велосипеди 26': '🚲',
  'Велосипеди 27.5': '🚲',
  'Велосипеди 29': '🚲',
  'Дитячі велосипеди 12': '🚲',
  'Дитячі велосипеди 14': '🚲',
  'Дитячі велосипеди 16': '🚲',
  'Дитячі велосипеди 18': '🚲',
  'Дитячі велосипеди 20': '🚲',
  // Автохімія
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
  type,
}: {
  items: { name: string; count: number }[];
  type?: string;
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

  const fallbackIcon = type === 'etransport' ? '🛞' : type === 'tools' ? '🔧' : '🧴';

  return (
    <div className="subcat-tiles">
      {items.map((it) => (
        <button
          key={it.name}
          className={`subcat-tile ${active === it.name ? 'active' : ''}`}
          onClick={() => pick(it.name)}
        >
          <span className="subcat-ico">{ICONS[it.name] ?? fallbackIcon}</span>
          <span className="subcat-name">{it.name}</span>
          <span className="subcat-count">{it.count}</span>
        </button>
      ))}
    </div>
  );
}
