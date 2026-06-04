import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Добробуд — електротранспорт, автохімія, інструмент',
  description:
    'Електросамокати, велосипеди, автохімія та електроінструмент з доставкою по Україні.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <CartProvider>
          <Header />
          <main className="container">{children}</main>
          <footer className="site-footer">
            <div className="footer-cols">
              <div>
                <div className="footer-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="Добробуд" className="footer-logo-img" />
                </div>
                <p>Автохімія, електротранспорт та інструмент з доставкою по всій Україні.</p>
              </div>
              <div>
                <h4>Каталог</h4>
                <a href="/catalog/chemistry">Автохімія та хімія</a>
                <a href="/catalog/etransport">Транспорт</a>
                <a href="/catalog/tools">Електроінструмент</a>
              </div>
              <div>
                <h4>Інформація</h4>
                <a href="/about">Про магазин</a>
                <a href="/delivery">Доставка та оплата</a>
                <a href="/faq">Часті питання</a>
                <a href="/about">Контакти</a>
              </div>
              <div>
                <h4>Зв&apos;язок</h4>
                <a href="tel:+380674100159">+38 067 410 0159</a>
                <a href="https://t.me/ProkopenkoVasyl" target="_blank" rel="noopener noreferrer">Telegram</a>
                <a href="https://www.tiktok.com/@pvmorgan" target="_blank" rel="noopener noreferrer">TikTok</a>
              </div>
            </div>
            <div className="footer-bottom">© {new Date().getFullYear()} Добробуд</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
