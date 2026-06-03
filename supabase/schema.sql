-- ============================================================
-- Добробуд — схема бази даних
-- Виконати в Supabase SQL Editor
-- ============================================================

-- Типи категорій товарів
create type category_type as enum ('etransport', 'chemistry', 'tools');

-- ------------------------------------------------------------
-- Категорії (дерево, для навігації каталогу)
-- ------------------------------------------------------------
create table if not exists categories (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title        text not null,
  type         category_type not null,
  parent_id    bigint references categories(id) on delete set null,
  icon         text,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- ------------------------------------------------------------
-- Джерела фідів (кожен постачальник = окремий рядок)
-- ------------------------------------------------------------
create table if not exists feed_sources (
  id           bigint generated always as identity primary key,
  name         text not null,
  url          text not null,
  format       text not null default 'xml',   -- 'xml' | 'yml'
  mapping_key  text not null,                 -- ключ конфіга в lib/feeds/mappings
  is_active    boolean default true,
  last_sync_at timestamptz,
  last_status  text,
  created_at   timestamptz default now()
);

-- ------------------------------------------------------------
-- Товари (єдина нормалізована таблиця)
-- ------------------------------------------------------------
create table if not exists products (
  id            bigint generated always as identity primary key,
  external_id   text,                         -- id з фіда
  source_id     bigint references feed_sources(id) on delete set null,
  slug          text not null unique,
  title         text not null,
  description   text,
  category_id   bigint references categories(id) on delete set null,
  category_type category_type not null,
  brand         text,
  price         numeric(12,2),
  old_price     numeric(12,2),
  currency      text default 'UAH',
  in_stock      boolean default true,
  images        text[] default '{}',
  -- Структуровані характеристики, різні для кожного типу:
  --   etransport: { "speed_kmh": 45, "range_km": 50, "power_w": 800, "battery": "48V 15Ah" }
  --   chemistry:  { "volume_ml": 500, "type": "поліроль", "for": "пластик" }
  --   tools:      { "power_w": 800, "voltage": "18V", "battery_count": 2 }
  specs         jsonb default '{}'::jsonb,
  is_featured   boolean default false,
  search_text   text,                         -- для повнотекстового пошуку
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Індекси для швидкого каталогу/пошуку
create index if not exists idx_products_category_type on products(category_type);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_products_in_stock on products(in_stock);
create index if not exists idx_products_specs on products using gin(specs);
create index if not exists idx_products_search on products using gin(to_tsvector('simple', coalesce(search_text, '')));
create unique index if not exists idx_products_source_ext on products(source_id, external_id);

-- Автооновлення updated_at + search_text
create or replace function products_before_write() returns trigger as $$
begin
  new.updated_at := now();
  new.search_text := lower(coalesce(new.title,'') || ' ' || coalesce(new.brand,'') || ' ' || coalesce(new.description,''));
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_write on products;
create trigger trg_products_write
  before insert or update on products
  for each row execute function products_before_write();

-- ------------------------------------------------------------
-- RLS: публічне читання, запис тільки service_role (cron/admin)
-- ------------------------------------------------------------
alter table products enable row level security;
alter table categories enable row level security;
alter table feed_sources enable row level security;

create policy "public read products"   on products    for select using (true);
create policy "public read categories" on categories  for select using (true);
-- feed_sources НЕ читається публічно (містить URL постачальників)

-- ------------------------------------------------------------
-- Тестові категорії
-- ------------------------------------------------------------
insert into categories (slug, title, type, icon, sort_order) values
  ('elektrotransport', 'Електротранспорт',  'etransport', 'scooter-electric', 1),
  ('avtohimiya',       'Автохімія та хімія', 'chemistry',  'spray',            2),
  ('elektroinstrument','Електроінструмент',  'tools',      'tool',             3)
on conflict (slug) do nothing;
