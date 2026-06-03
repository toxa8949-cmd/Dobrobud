'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function AddToCartButton({
  id,
  slug,
  title,
  price,
  disabled,
}: {
  id: number;
  slug: string;
  title: string;
  price: number;
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handle = () => {
    add({ id, slug, title, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button className="buy-btn" disabled={disabled} onClick={handle}>
      {added ? '✓ Додано' : 'Додати в кошик'}
    </button>
  );
}
