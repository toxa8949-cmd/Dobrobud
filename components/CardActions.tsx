'use client';

import { useState } from 'react';

// Кнопка обраного (у кутку фото)
export function FavButton() {
  const [fav, setFav] = useState(false);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav((f) => !f);
  };
  return (
    <button className={`fav-btn ${fav ? 'on' : ''}`} onClick={toggle} aria-label="В обране">
      {fav ? '♥' : '♡'}
    </button>
  );
}
