'use client';

import { useState, useEffect, useCallback } from 'react';

type Stats = {
  products: number;
  orders: number;
  newOrders: number;
  noPhoto: number;
  noDesc: number;
  revenue: number;
  doneCount: number;
  recentOrders: { id: number; customer_name: string; total: number; status: string; created_at: string }[];
};

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const ST: Record<string, string> = {
  new: 'Новий', processing: 'В обробці', shipped: 'Відправлено', done: 'Виконано', cancelled: 'Скасовано',
};

export default function DashboardPanel({ headers }: { headers: () => HeadersInit }) {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: headers() });
      setS(await res.json());
    } catch {
      setS(null);
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="adm-muted">Завантаження статистики…</p>;
  if (!s) return <p className="adm-muted">Не вдалося завантажити статистику</p>;

  return (
    <div>
      <div className="adm-stats">
        <div className="adm-stat">
          <span className="adm-stat-num">{fmt(s.revenue)} ₴</span>
          <span className="adm-stat-label">Сума замовлень</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-num">{fmt(s.orders)}</span>
          <span className="adm-stat-label">Усього замовлень</span>
        </div>
        <div className="adm-stat adm-stat-accent">
          <span className="adm-stat-num">{fmt(s.newOrders)}</span>
          <span className="adm-stat-label">Нових замовлень</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-num">{fmt(s.doneCount)}</span>
          <span className="adm-stat-label">Виконано</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-num">{fmt(s.products)}</span>
          <span className="adm-stat-label">Товарів у базі</span>
        </div>
        <div className="adm-stat adm-stat-warn">
          <span className="adm-stat-num">{fmt(s.noPhoto)}</span>
          <span className="adm-stat-label">Без фото</span>
        </div>
        <div className="adm-stat adm-stat-warn">
          <span className="adm-stat-num">{fmt(s.noDesc)}</span>
          <span className="adm-stat-label">Без опису</span>
        </div>
      </div>

      <h3 className="adm-subtitle">Останні замовлення</h3>
      {s.recentOrders.length === 0 ? (
        <p className="adm-muted">Замовлень ще немає</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>Клієнт</th><th>Сума</th><th>Статус</th><th>Дата</th></tr>
          </thead>
          <tbody>
            {s.recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{fmt(o.total)} ₴</td>
                <td>{ST[o.status] ?? o.status}</td>
                <td>{fmtDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
