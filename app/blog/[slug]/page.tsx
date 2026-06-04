import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES, getArticle } from '@/lib/articles';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: 'Стаття — Добробуд' };
  return { title: `${a.title} — Добробуд`, description: a.excerpt };
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  return (
    <div className="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: a.title,
            description: a.excerpt,
            datePublished: a.date,
            author: { '@type': 'Organization', name: 'Добробуд' },
            publisher: { '@type': 'Organization', name: 'Добробуд' },
          }),
        }}
      />
      <a className="article-back" href="/blog">← Усі статті</a>
      <div className="article-emoji">{a.emoji}</div>
      <div className="article-date">{fmtDate(a.date)}</div>
      <h1>{a.title}</h1>
      <div className="article-body">
        {a.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
