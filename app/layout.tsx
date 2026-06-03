import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Добробуд — електротранспорт, автохімія, інструмент',
  description:
    'Електросамокати, велосипеди, автохімія та електроінструмент з доставкою по Україні.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <header className="site-header">
          <a href="/" className="logo">
            <span className="logo-mark">⚡</span>
            <span>Добробуд</span>
          </a>
          <form action="/search" className="search">
            <input name="q" placeholder="Самокати, велосипеди, хімія, інструмент…" />
          </form>
          <nav className="header-nav">
            <a href="/catalog/etransport">Електротранспорт</a>
            <a href="/catalog/chemistry">Автохімія</a>
            <a href="/catalog/tools">Інструмент</a>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Добробуд · Доставка по всій Україні</p>
        </footer>
      </body>
    </html>
  );
}
