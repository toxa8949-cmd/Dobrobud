'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function QuickBuy({
  id,
  slug,
  title,
  price,
  image,
}: {
  id: number;
  slug: string;
  title: string;
  price: number;
  image?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const buy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ id, slug, title, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };
  return (
    <button className={`quick-buy ${added ? 'added' : ''}`} onClick={buy}>
      {added ? '✓ Додано в кошик' : 'У кошик'}
    </button>
  );
}
