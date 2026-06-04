'use client';

import { useState, useEffect, useCallback } from 'react';

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  city: string;
  note: string | null;
  items: { title: string; price: number; qty: number }[];
  total: number;
  status: string;
  created_at: string;
};

const STATUSES: Record<string, { label: string; cls: string }> = {
  new: { label: 'Новий', cls: 'st-new' },
  processing: { label: 'В обробці', cls: 'st-proc' },
  shipped: { label: 'Відправлено', cls: 'st-ship' },
  done: { label: 'Виконано', cls: 'st-done' },
  cancelled: { label: 'Скасовано', cls: 'st-cancel' },
};

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OrdersPanel({ headers }: { headers: () => HeadersInit }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/admin/orders${filter ? `?status=${filter}` : ''}`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, [filter, headers]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: number, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div>
      <div className="adm-bar">
        <div className="adm-chips">
          <button className={!filter ? 'on' : ''} onClick={() => setFilter('')}>Усі</button>
          {Object.entries(STATUSES).map(([k, v]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{v.label}</button>
          ))}
        </div>
        <button className="adm-refresh" onClick={load}>↻ Оновити</button>
      </div>

      {loading ? (
        <p className="adm-muted">Завантаження…</p>
      ) : orders.length === 0 ? (
        <p className="adm-muted">Замовлень немає</p>
      ) : (
        <div className="adm-orders">
          {orders.map((o) => (
            <div className="adm-order" key={o.id}>
              <div className="adm-order-head" onClick={() => setOpen(open === o.id ? null : o.id)}>
                <div>
                  <strong>#{o.id} · {o.customer_name}</strong>
                  <span className="adm-order-meta">{o.phone} · {o.city} · {fmtDate(o.created_at)}</span>
                </div>
                <div className="adm-order-right">
                  <span className="adm-order-total">{fmt(o.total)} ₴</span>
                  <span className={`adm-status ${STATUSES[o.status]?.cls ?? ''}`}>{STATUSES[o.status]?.label ?? o.status}</span>
                </div>
              </div>
              {open === o.id && (
                <div className="adm-order-body">
                  <div className="adm-order-items">
                    {o.items.map((it, i) => (
                      <div key={i} className="adm-order-item">
                        <span>{it.title}</span>
                        <span>{it.qty} × {fmt(it.price)} ₴</span>
                      </div>
                    ))}
                  </div>
                  {o.note && <p className="adm-order-note">Коментар: {o.note}</p>}
                  <div className="adm-order-actions">
                    <span>Статус:</span>
                    {Object.entries(STATUSES).map(([k, v]) => (
                      <button
                        key={k}
                        className={`adm-st-btn ${o.status === k ? 'active' : ''}`}
                        onClick={() => changeStatus(o.id, k)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
