'use client';

import { useState, useRef } from 'react';

// Завантаження/керування зображеннями.
// multiple=true → масив фото (товари). multiple=false → одне фото (набір).
export default function ImageUpload({
  images,
  onChange,
  headers,
  multiple = true,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  headers: () => HeadersInit;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        // headers() містить Content-Type: application/json — для FormData його прибираємо
        const h = { ...(headers() as Record<string, string>) };
        delete h['Content-Type'];
        const res = await fetch('/api/admin/upload', { method: 'POST', headers: h, body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Помилка завантаження');
        uploaded.push(data.url);
        if (!multiple) break;
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (i: number) => onChange(images.filter((_, j) => j !== i));

  return (
    <div className="img-upload">
      <div className="img-upload-grid">
        {images.map((url, i) => (
          <div className="img-thumb" key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
            <button type="button" onClick={() => removeAt(i)} aria-label="Видалити">✕</button>
          </div>
        ))}
        {(multiple || images.length === 0) && (
          <button
            type="button"
            className="img-add"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '…' : '+ Фото'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => upload(e.target.files)}
      />
      {error && <p className="admin-err" style={{ marginTop: 6 }}>{error}</p>}
      <p className="img-upload-hint">Завантажте з пристрою або вставте URL нижче</p>
    </div>
  );
}
