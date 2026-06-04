import type { Metadata } from 'next';
import { getTikTokProducts } from '@/lib/supabase';
import { getBundles } from '@/lib/bundles';
import TikTokCard from '@/components/TikTokCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Товари з TikTok — Добробуд',
  description: 'Товари та набори, які ви бачили в нашому TikTok. Замовляйте онлайн з доставкою по Україні.',
};

const fmtPrice = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

function bestDiscount(tiers: { type: string; value: number }[]): string {
  if (!tiers?.length) return '';
  const best = [...tiers].sort((a, z) => (z.type === 'percent' ? z.value : 0) - (a.type === 'percent' ? a.value : 0))[0];
  if (!best) return '';
  return best.type === 'percent' ? `−${best.value}%` : `−${fmtPrice(best.value)} ₴`;
}

export default async function TikTokPage() {
  const [products, bundles] = await Promise.all([getTikTokProducts(), getBundles()]);

  return (
    <>
      <div className="tiktok-banner">
        <span className="tiktok-badge big">TikTok</span>
        <h1>Товари з нашого TikTok</h1>
        <p>Усе, що ви бачили у відео — зібрано в одному місці. Обирайте та замовляйте з доставкою по Україні.</p>
      </div>

      {bundles.length > 0 && (
        <div className="tiktok-sets">
          <h2 className="tiktok-sets-title">🎁 Набори зі знижкою</h2>
          <div className="grid">
            {bundles.map((b) => {
              const disc = bestDiscount(b.discount_tiers);
              return (
                <a key={b.slug} href={`/set/${b.slug}`} className="set-card">
                  <div className="set-card-img">
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt={b.title} />
                    ) : (
                      <span className="set-card-emoji">{b.emoji || '🎁'}</span>
                    )}
                    <span className="set-card-badge">Набір</span>
                  </div>
                  <div className="set-card-body">
                    <div className="set-card-name">{b.title}</div>
                    <div className="set-card-meta">
                      {b.product_ids?.length ?? 0} товарів{disc ? ` · знижка ${disc}` : ''}
                    </div>
                    <span className="set-card-btn">Відкрити набір →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid">
          {products.map((p) => (
            <TikTokCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        bundles.length === 0 && <p className="empty">Поки що немає товарів у цій добірці. Зазирніть пізніше!</p>
      )}
    </>
  );
}
