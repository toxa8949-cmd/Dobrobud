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
        {b.description && <p>{b.description}</p>}
        <span className="bundle-count">{b.products.length} товарів у наборі</span>
      </div>

      <BundleClient products={b.products} tiers={b.discount_tiers} />
    </div>
  );
}
