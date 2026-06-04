'use client';

import { useState, useEffect, useCallback } from 'react';

type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  emoji: string | null;
  body: string;
  published: boolean;
};

const empty = { id: 0, slug: '', title: '', excerpt: '', emoji: '📝', body: '', published: true };

export default function BlogPanel({ headers }: { headers: () => HeadersInit }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<typeof empty | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles', { headers: headers() });
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!edit || !edit.title.trim()) return;
    setSaving(true);
    const method = edit.id ? 'PATCH' : 'POST';
    await fetch('/api/admin/articles', {
      method,
      headers: headers(),
      body: JSON.stringify(edit),
    });
    setSaving(false);
    setEdit(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Видалити статтю?')) return;
    await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  if (edit) {
    return (
      <div className="adm-editor">
        <div className="adm-editor-head">
          <h3>{edit.id ? 'Редагувати статтю' : 'Нова стаття'}</h3>
          <button className="adm-link" onClick={() => setEdit(null)}>← Назад до списку</button>
        </div>
        <label className="adm-field">
          <span>Емодзі</span>
          <input value={edit.emoji} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} maxLength={4} style={{ width: 80 }} />
        </label>
        <label className="adm-field">
          <span>Заголовок</span>
          <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
        </label>
        <label className="adm-field">
          <span>URL (slug) — лишіть порожнім для автогенерації</span>
          <input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} placeholder="yak-obraty-velosyped" />
        </label>
        <label className="adm-field">
          <span>Короткий опис</span>
          <textarea rows={2} value={edit.excerpt ?? ''} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
        </label>
        <label className="adm-field">
          <span>Текст статті (абзаци розділяйте порожнім рядком)</span>
          <textarea rows={14} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} />
          Опубліковано (видно на сайті)
        </label>
        <div className="adm-editor-actions">
          <button className="adm-btn-primary" onClick={save} disabled={saving || !edit.title.trim()}>
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
          <button className="adm-btn-ghost" onClick={() => setEdit(null)}>Скасувати</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-bar">
        <button className="adm-btn-primary" onClick={() => setEdit({ ...empty })}>+ Нова стаття</button>
        <button className="adm-refresh" onClick={load}>↻ Оновити</button>
      </div>
      {loading ? (
        <p className="adm-muted">Завантаження…</p>
      ) : articles.length === 0 ? (
        <p className="adm-muted">Статей ще немає. Створіть першу!</p>
      ) : (
        <div className="adm-articles">
          {articles.map((a) => (
            <div className="adm-article" key={a.id}>
              <span className="adm-article-emoji">{a.emoji}</span>
              <div className="adm-article-info">
                <strong>{a.title}</strong>
                <span className="adm-article-slug">/{a.slug} {!a.published && '· чернетка'}</span>
              </div>
              <div className="adm-article-actions">
                <button className="adm-link" onClick={() => setEdit({ ...a, excerpt: a.excerpt ?? '', emoji: a.emoji ?? '📝' })}>Редагувати</button>
                <button className="adm-link adm-danger" onClick={() => remove(a.id)}>Видалити</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
