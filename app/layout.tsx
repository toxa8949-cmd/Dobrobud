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
            <p>© {new Date().getFullYear()} Добробуд · Доставка по всій Україні</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
