import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBundleBySlug } from '@/lib/bundles';
import BundleClient from './BundleClient';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBundleBySlug(slug);
  if (!b) return { title: 'Набір — Добробуд' };
  return { title: `${b.title} — Добробуд`, description: b.description ?? undefined };
}

export default async function BundlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = await getBundleBySlug(slug);
  if (!b) notFound();

  return (
    <div className="info-page">
      <div className="bundle-hero">
        <span className="bundle-badge">{b.emoji} Набір з TikTok</span>
        <h1>{b.title}</h1>
        <span className="bundle-count">{b.products.length} товарів у наборі</span>
      </div>

      {b.description && <BundleDescription text={b.description} />}

      <BundleClient products={b.products} tiers={b.discount_tiers} />
    </div>
  );
}

// Форматує опис набору: абзаци та пункти списку.
function BundleDescription({ text }: { text: string }) {
  // Якщо текст суцільний (мало переносів, але є маркери •) — додамо переноси перед •
  let prepared = text.replace(/\r/g, '');
  if ((prepared.match(/\n/g)?.length ?? 0) < 2 && prepared.includes('•')) {
    prepared = prepared.replace(/\s*•\s*/g, '\n• ');
  }
  const lines = prepared.split('\n').map((l) => l.trim());

  const blocks: { type: 'p' | 'ul'; items: string[] }[] = [];
  for (const line of lines) {
    if (!line) continue;
    const isBullet = /^[•\-·]/.test(line);
    const last = blocks[blocks.length - 1];
    if (isBullet) {
      const clean = line.replace(/^[•\-·]\s*/, '');
      if (last && last.type === 'ul') last.items.push(clean);
      else blocks.push({ type: 'ul', items: [clean] });
    } else {
      blocks.push({ type: 'p', items: [line] });
    }
  }

  return (
    <div className="bundle-desc">
      {blocks.map((b, i) =>
        b.type === 'ul' ? (
          <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
        ) : (
          <p key={i}>{b.items[0]}</p>
        )
      )}
    </div>
  );
}
