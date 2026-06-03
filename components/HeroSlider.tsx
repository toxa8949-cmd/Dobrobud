'use client';

import { useState, useEffect } from 'react';

interface Slide {
  tag: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  gradient: string;
  glyph: string;
}

const SLIDES: Slide[] = [
  {
    tag: 'Топ продажів',
    title: 'Електротранспорт сезону',
    text: 'Самокати та велосипеди з потужними батареями',
    href: '/catalog/etransport',
    cta: 'Перейти',
    gradient: 'linear-gradient(120deg, #1d4ed8 0%, #3b82f6 100%)',
    glyph: '⚡',
  },
  {
    tag: 'Великий вибір',
    title: 'Автохімія та догляд за авто',
    text: 'Оливи, поліролі, очисники — понад 2500 товарів',
    href: '/catalog/chemistry',
    cta: 'До каталогу',
    gradient: 'linear-gradient(120deg, #be185d 0%, #ec4899 100%)',
    glyph: '🧴',
  },
  {
    tag: 'Для майстра',
    title: 'Електроінструмент',
    text: 'Дрилі, шуруповерти, болгарки відомих брендів',
    href: '/catalog/tools',
    cta: 'Обрати',
    gradient: 'linear-gradient(120deg, #b45309 0%, #f59e0b 100%)',
    glyph: '🔧',
  },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];

  return (
    <a className="hero-slide" href={s.href} style={{ background: s.gradient }}>
      <span className="hero-slide-glyph">{s.glyph}</span>
      <span className="hero-slide-tag">{s.tag}</span>
      <h2>{s.title}</h2>
      <p>{s.text}</p>
      <span className="hero-slide-cta">{s.cta} →</span>
      <div className="hero-dots" onClick={(e) => e.preventDefault()}>
        {SLIDES.map((_, n) => (
          <span
            key={n}
            className={n === i ? 'on' : ''}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setI(n);
            }}
          />
        ))}
      </div>
    </a>
  );
}
