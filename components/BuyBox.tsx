'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function BuyBox({
  id,
  slug,
  title,
  price,
  inStock,
  image,
}: {
  id: number;
  slug: string;
  title: string;
  price: number;
  inStock: boolean;
  image?: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handle = () => {
    add({ id, slug, title, price, image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="buybox">
      <div className="qty-picker">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Менше">−</button>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        />
        <button onClick={() => setQty((q) => q + 1)} aria-label="Більше">+</button>
      </div>
      <button className="buy-btn" disabled={!inStock} onClick={handle}>
        {added ? '✓ Додано в кошик' : 'Додати в кошик'}
      </button>
    </div>
  );
}
