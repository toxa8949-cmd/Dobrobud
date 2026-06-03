import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Добробуд — електротранспорт, автохімія, інструмент',
  description:
    'Електросамокати, велосипеди, автохімія та електроінструмент з доставкою по Україні.',
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
                <div className="footer-logo"><span className="logo-mark">⚡</span> Добробуд</div>
                <p>Автохімія, електротранспорт та інструмент з доставкою по всій Україні.</p>
              </div>
              <div>
                <h4>Каталог</h4>
                <a href="/catalog/chemistry">Автохімія та хімія</a>
                <a href="/catalog/etransport">Електротранспорт</a>
                <a href="/catalog/tools">Електроінструмент</a>
              </div>
              <div>
                <h4>Інформація</h4>
                <a href="#">Про магазин</a>
                <a href="#">Доставка та оплата</a>
                <a href="#">Контакти</a>
              </div>
              <div>
                <h4>Зв&apos;язок</h4>
                <a href="#">+38 (0XX) XXX-XX-XX</a>
                <a href="#">info@dobrobud.ua</a>
              </div>
            </div>
            <div className="footer-bottom">© {new Date().getFullYear()} Добробуд</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
