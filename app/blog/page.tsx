import type { Metadata } from 'next';
import { getArticles } from '@/lib/articles';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Блог — Добробуд',
  description: 'Поради щодо вибору транспорту, догляду за технікою та автохімії від магазину Добробуд.',
};

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <div className="info-page">
      <div className="info-hero">
        <h1>Блог</h1>
        <p>Поради щодо вибору, догляду та експлуатації</p>
      </div>

      <div className="blog-grid">
        {articles.map((a) => (
          <a key={a.slug} className="blog-card" href={`/blog/${a.slug}`}>
            <div className="blog-card-img">{a.emoji}</div>
            <div className="blog-card-body">
              <div className="blog-card-date">{fmtDate(a.date)}</div>
              <h2>{a.title}</h2>
              <p>{a.excerpt}</p>
              <span className="blog-card-more">Читати →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
