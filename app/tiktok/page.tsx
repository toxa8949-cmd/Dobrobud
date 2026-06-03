import type { Metadata } from 'next';
import { getTikTokProducts } from '@/lib/supabase';
import TikTokCard from '@/components/TikTokCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Товари з TikTok — Добробуд',
  description: 'Товари, які ви бачили в нашому TikTok. Замовляйте онлайн з доставкою по Україні.',
};

export default async function TikTokPage() {
  const products = await getTikTokProducts();

  return (
    <>
      <div className="tiktok-banner">
        <span className="tiktok-badge big">TikTok</span>
        <h1>Товари з нашого TikTok</h1>
        <p>Усе, що ви бачили у відео — зібрано в одному місці. Обирайте та замовляйте з доставкою по Україні.</p>
      </div>

      {products.length > 0 ? (
        <div className="grid">
          {products.map((p) => (
            <TikTokCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <p className="empty">Поки що немає товарів у цій добірці. Зазирніть пізніше!</p>
      )}
    </>
  );
}
