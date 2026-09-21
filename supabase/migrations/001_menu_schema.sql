create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  cuisine text not null,
  sort_order int not null default 0
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid not null references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  allergens text[] not null default '{}',
  dietary_tags text[] not null default '{}',
  spice_level int check (spice_level between 0 and 4),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_categories_restaurant on menu_categories(restaurant_id);
create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id);
