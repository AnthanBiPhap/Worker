-- Commerce-style dashboard data for TailAdmin widgets.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  phone text,
  company text,
  customer_type text not null default 'individual'
    check (customer_type in ('individual', 'business', 'architect')),
  source text,
  location text,
  avatar_url text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  category text,
  amount numeric(15,2) not null default 0,
  status text not null default 'pending'
    check (status in ('delivered', 'pending', 'canceled')),
  order_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_targets (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  target_revenue numeric(15,2) not null default 0,
  target_orders integer not null default 0,
  target_customers integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_location on public.customers(location);
create index if not exists idx_customers_source on public.customers(source);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_order_date on public.orders(order_date);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_monthly_targets_month on public.monthly_targets(month);

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_monthly_targets_updated_at on public.monthly_targets;
create trigger set_monthly_targets_updated_at
  before update on public.monthly_targets
  for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.monthly_targets enable row level security;

drop policy if exists "Editors can read customers" on public.customers;
create policy "Editors can read customers"
  on public.customers for select
  using (public.is_editor());

drop policy if exists "Admins can manage customers" on public.customers;
create policy "Admins can manage customers"
  on public.customers for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Editors can read orders" on public.orders;
create policy "Editors can read orders"
  on public.orders for select
  using (public.is_editor());

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Editors can read monthly targets" on public.monthly_targets;
create policy "Editors can read monthly targets"
  on public.monthly_targets for select
  using (public.is_editor());

drop policy if exists "Admins can manage monthly targets" on public.monthly_targets;
create policy "Admins can manage monthly targets"
  on public.monthly_targets for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.customers (
  full_name,
  email,
  phone,
  company,
  customer_type,
  source,
  location,
  avatar_url,
  first_seen_at,
  last_seen_at
)
values
  ('Nguyễn Minh Anh', 'minhanh@example.com', '0901000001', null, 'individual', 'Website', 'TP. Hồ Chí Minh', '/images/user/user-17.jpg', now() - interval '320 days', now() - interval '2 days'),
  ('Trần Quốc Bảo', 'quocbao@example.com', '0901000002', 'Bảo Gia Construction', 'business', 'Facebook', 'Hà Nội', '/images/user/user-18.jpg', now() - interval '280 days', now() - interval '8 days'),
  ('Lê Hoàng Nam', 'hoangnam@example.com', '0901000003', 'Nam Architecture', 'architect', 'Google', 'Đà Nẵng', '/images/user/user-20.jpg', now() - interval '240 days', now() - interval '4 days'),
  ('Phạm Thùy Linh', 'thuylinh@example.com', '0901000004', null, 'individual', 'Referral', 'Bình Dương', '/images/user/user-21.jpg', now() - interval '200 days', now() - interval '11 days'),
  ('Công ty An Phát', 'contact@anphat.example.com', '0901000005', 'An Phát Group', 'business', 'Website', 'Đồng Nai', '/images/user/user-22.jpg', now() - interval '170 days', now() - interval '1 days'),
  ('KTS Võ Gia Hân', 'giahan@example.com', '0901000006', 'Gia Hân Studio', 'architect', 'Google', 'Khánh Hòa', '/images/user/user-23.jpg', now() - interval '140 days', now() - interval '5 days')
on conflict (email) do update
set
  full_name = excluded.full_name,
  phone = excluded.phone,
  company = excluded.company,
  customer_type = excluded.customer_type,
  source = excluded.source,
  location = excluded.location,
  avatar_url = excluded.avatar_url,
  last_seen_at = excluded.last_seen_at;

insert into public.monthly_targets (
  month,
  target_revenue,
  target_orders,
  target_customers,
  note
)
select
  (date_trunc('month', current_date) - (month_offset || ' months')::interval)::date as month,
  case month_offset
    when 0 then 450000000
    when 1 then 420000000
    when 2 then 400000000
    else 350000000 + (month_offset * 5000000)
  end,
  case month_offset when 0 then 18 when 1 then 16 else 14 end,
  case month_offset when 0 then 30 when 1 then 26 else 22 end,
  'Seed target for TailAdmin dashboard'
from generate_series(0, 11) as month_offset
on conflict (month) do update
set
  target_revenue = excluded.target_revenue,
  target_orders = excluded.target_orders,
  target_customers = excluded.target_customers,
  note = excluded.note;

with customer_lookup as (
  select id, email from public.customers
),
seed_orders as (
  select * from (
    values
      ('ORD-TA-0001', 'minhanh@example.com', 'Cửa chớp nhôm ngang hệ 80', 'Residential', 68500000::numeric, 'delivered', 0, 2),
      ('ORD-TA-0002', 'contact@anphat.example.com', 'Gói cửa chớp mặt tiền nhà xưởng', 'Commercial', 128000000::numeric, 'pending', 0, 5),
      ('ORD-TA-0003', 'giahan@example.com', 'Cửa chớp nhôm điều chỉnh biệt thự', 'Villa', 96500000::numeric, 'delivered', 0, 10),
      ('ORD-TA-0004', 'quocbao@example.com', 'Hệ lam chớp nhôm công trình văn phòng', 'Commercial', 174000000::numeric, 'delivered', 1, 7),
      ('ORD-TA-0005', 'hoangnam@example.com', 'Cửa chớp nhôm dọc resort', 'Hospitality', 142000000::numeric, 'pending', 1, 18),
      ('ORD-TA-0006', 'thuylinh@example.com', 'Cửa chớp ban công nhà phố', 'Residential', 52000000::numeric, 'canceled', 2, 4),
      ('ORD-TA-0007', 'minhanh@example.com', 'Bổ sung cửa chớp khu giếng trời', 'Residential', 36500000::numeric, 'delivered', 2, 12),
      ('ORD-TA-0008', 'quocbao@example.com', 'Hệ chớp thông gió nhà máy', 'Industrial', 210000000::numeric, 'delivered', 3, 6),
      ('ORD-TA-0009', 'contact@anphat.example.com', 'Cửa chớp cố định showroom', 'Commercial', 88000000::numeric, 'delivered', 4, 14),
      ('ORD-TA-0010', 'giahan@example.com', 'Lam chớp nhôm sân thượng', 'Villa', 61000000::numeric, 'pending', 5, 20),
      ('ORD-TA-0011', 'hoangnam@example.com', 'Cửa chớp nhôm khu nghỉ dưỡng', 'Hospitality', 240000000::numeric, 'delivered', 6, 8),
      ('ORD-TA-0012', 'thuylinh@example.com', 'Cửa chớp nhôm căn hộ duplex', 'Residential', 73000000::numeric, 'delivered', 7, 16),
      ('ORD-TA-0013', 'minhanh@example.com', 'Cửa chớp lấy gió phòng ngủ', 'Residential', 42000000::numeric, 'delivered', 8, 9),
      ('ORD-TA-0014', 'quocbao@example.com', 'Hệ lam chớp nhà phố thương mại', 'Commercial', 133000000::numeric, 'delivered', 9, 11),
      ('ORD-TA-0015', 'contact@anphat.example.com', 'Cửa chớp nhôm kho vận', 'Industrial', 186000000::numeric, 'pending', 10, 13),
      ('ORD-TA-0016', 'giahan@example.com', 'Cửa chớp biệt thự ven biển', 'Villa', 152000000::numeric, 'delivered', 11, 15)
  ) as value(order_number, email, title, category, amount, status, month_offset, day_offset)
)
insert into public.orders (
  order_number,
  customer_id,
  title,
  category,
  amount,
  status,
  order_date
)
select
  seed_orders.order_number,
  customer_lookup.id,
  seed_orders.title,
  seed_orders.category,
  seed_orders.amount,
  seed_orders.status,
  ((date_trunc('month', current_date) - (seed_orders.month_offset || ' months')::interval)::date + ((seed_orders.day_offset - 1) * interval '1 day'))::date
from seed_orders
join customer_lookup on customer_lookup.email = seed_orders.email
on conflict (order_number) do update
set
  customer_id = excluded.customer_id,
  title = excluded.title,
  category = excluded.category,
  amount = excluded.amount,
  status = excluded.status,
  order_date = excluded.order_date;
