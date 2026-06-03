'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function CardActions({
  id,
  slug,
  title,
  price,
  inStock,
}: {
  id: number;
  slug: string;
  title: string;
  price: number;
  inStock: boolean;
}) {
  const { add } = useCart();
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);

  const buy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ id, slug, title, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav((f) => !f);
  };

  return (
    <>
      <button
        className={`fav-btn ${fav ? 'on' : ''}`}
        onClick={toggleFav}
        aria-label="В обране"
      >
        {fav ? '♥' : '♡'}
      </button>
      {inStock && (
        <button className={`quick-buy ${added ? 'added' : ''}`} onClick={buy}>
          {added ? '✓ Додано' : 'У кошик'}
        </button>
      )}
    </>
  );
}
