-- Initial backend schema for the aluminum louver business website.
-- Run migrations via: supabase db push

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'viewer'
    check (role in ('super_admin', 'admin', 'editor', 'viewer')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin')
  );
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'editor')
  );
$$;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.product_categories(id),
  sort_order integer default 0,
  is_active boolean not null default true,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories(id),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  price_from numeric(15,2),
  price_to numeric(15,2),
  images jsonb not null default '[]'::jsonb,
  catalog_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  sort_order integer default 0,
  view_count integer not null default 0,
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image_url text,
  search_vector tsvector,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  hex_code text,
  image_url text,
  sort_order integer default 0
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  client_name text,
  location text,
  area text,
  project_type text,
  completion_date date,
  description text,
  images jsonb not null default '[]'::jsonb,
  cover_image_url text,
  is_featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  meta_title text,
  meta_description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id),
  author_id uuid references public.profiles(id),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  cover_image_alt text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  scheduled_at timestamptz,
  view_count integer not null default 0,
  read_time_min integer,
  tags text[] default '{}',
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image_url text,
  canonical_url text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  company text,
  lead_type text not null default 'individual'
    check (lead_type in ('individual', 'business', 'architect')),
  source text,
  source_url text,
  product_interest uuid references public.products(id),
  project_description text,
  budget_range text,
  area_size text,
  location text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'spam')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id),
  notes text,
  chat_session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid references public.profiles(id),
  type text not null
    check (type in ('note', 'call', 'email', 'meeting', 'status_change', 'assignment')),
  content text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text not null unique,
  visitor_id text,
  messages jsonb not null default '[]'::jsonb,
  lead_id uuid references public.leads(id),
  page_url text,
  device_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text not null,
  file_size integer,
  width integer,
  height integer,
  alt_text text,
  folder text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  label text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  avatar_url text,
  content text not null,
  rating smallint check (rating between 1 and 5),
  project_id uuid references public.projects(id),
  is_active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create or replace function public.update_products_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector =
    to_tsvector('simple', coalesce(new.name, '') || ' ' || coalesce(new.short_description, '') || ' ' || coalesce(new.description, ''));
  return new;
end;
$$;

create or replace function public.update_blog_posts_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector =
    to_tsvector('simple', coalesce(new.title, '') || ' ' || coalesce(new.excerpt, '') || ' ' || coalesce(new.content, ''));
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger product_categories_set_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger chat_sessions_set_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger products_search_vector
  before insert or update on public.products
  for each row execute function public.update_products_search_vector();

create trigger blog_posts_search_vector
  before insert or update on public.blog_posts
  for each row execute function public.update_blog_posts_search_vector();

create index if not exists idx_product_categories_slug on public.product_categories(slug);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status_featured on public.products(status, is_featured);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_status_featured on public.projects(status, is_featured);
create index if not exists idx_blog_categories_slug on public.blog_categories(slug);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status_published_at on public.blog_posts(status, published_at desc);
create index if not exists idx_blog_posts_search_vector on public.blog_posts using gin(search_vector);
create index if not exists idx_leads_status_created_at on public.leads(status, created_at desc);
create index if not exists idx_leads_assigned_to on public.leads(assigned_to);
create index if not exists idx_lead_activities_lead_id on public.lead_activities(lead_id);
create index if not exists idx_chat_sessions_token on public.chat_sessions(session_token);
create index if not exists idx_media_files_folder on public.media_files(folder);

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.projects enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.media_files enable row level security;
alter table public.site_settings enable row level security;
alter table public.testimonials enable row level security;

create policy "Profiles can read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Profiles can update own profile"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Public can read active product categories"
  on public.product_categories for select
  using (is_active = true or public.is_editor());

create policy "Editors can manage product categories"
  on public.product_categories for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read published products"
  on public.products for select
  using (status = 'published' or public.is_editor());

create policy "Editors can manage products"
  on public.products for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read colors for published products"
  on public.product_colors for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_colors.product_id
        and (products.status = 'published' or public.is_editor())
    )
  );

create policy "Editors can manage product colors"
  on public.product_colors for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read published projects"
  on public.projects for select
  using (status = 'published' or public.is_editor());

create policy "Editors can manage projects"
  on public.projects for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read active blog categories"
  on public.blog_categories for select
  using (is_active = true or public.is_editor());

create policy "Editors can manage blog categories"
  on public.blog_categories for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read published blog posts"
  on public.blog_posts for select
  using (status = 'published' or public.is_editor());

create policy "Editors can manage blog posts"
  on public.blog_posts for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Anyone can create leads"
  on public.leads for insert
  with check (true);

create policy "Admins can manage leads"
  on public.leads for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage lead activities"
  on public.lead_activities for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Anyone can create chat sessions"
  on public.chat_sessions for insert
  with check (true);

create policy "Admins can manage chat sessions"
  on public.chat_sessions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read media"
  on public.media_files for select
  using (true);

create policy "Editors can manage media"
  on public.media_files for all
  using (public.is_editor())
  with check (public.is_editor());

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read active testimonials"
  on public.testimonials for select
  using (is_active = true or public.is_editor());

create policy "Editors can manage testimonials"
  on public.testimonials for all
  using (public.is_editor())
  with check (public.is_editor());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('projects', 'projects', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('blog', 'blog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('catalogs', 'catalogs', true, 20971520, array['application/pdf']),
  ('general', 'general', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Public can read storage objects"
  on storage.objects for select
  using (bucket_id in ('products', 'projects', 'blog', 'catalogs', 'general', 'avatars'));

create policy "Editors can upload storage objects"
  on storage.objects for insert
  with check (bucket_id in ('products', 'projects', 'blog', 'catalogs', 'general', 'avatars') and public.is_editor());

create policy "Editors can update storage objects"
  on storage.objects for update
  using (bucket_id in ('products', 'projects', 'blog', 'catalogs', 'general', 'avatars') and public.is_editor())
  with check (bucket_id in ('products', 'projects', 'blog', 'catalogs', 'general', 'avatars') and public.is_editor());

create policy "Editors can delete storage objects"
  on storage.objects for delete
  using (bucket_id in ('products', 'projects', 'blog', 'catalogs', 'general', 'avatars') and public.is_editor());

insert into public.product_categories (name, slug, description, sort_order)
values
  ('Cửa chớp nhôm ngang', 'cua-chop-nhom-ngang', 'Dòng cửa chớp nhôm nan ngang cho ban công, mặt tiền và thông gió.', 1),
  ('Cửa chớp nhôm dọc', 'cua-chop-nhom-doc', 'Dòng cửa chớp nhôm nan dọc cho kiến trúc hiện đại.', 2),
  ('Cửa chớp nhôm cố định', 'cua-chop-nhom-co-dinh', 'Giải pháp cố định, bền vững cho công trình dân dụng và thương mại.', 3),
  ('Cửa chớp nhôm điều chỉnh', 'cua-chop-nhom-dieu-chinh', 'Hệ cửa có thể điều chỉnh góc mở, tối ưu nắng gió.', 4)
on conflict (slug) do nothing;

insert into public.products (
  category_id,
  name,
  slug,
  sku,
  short_description,
  description,
  specifications,
  price_from,
  status,
  is_featured,
  sort_order,
  meta_title,
  meta_description
)
select
  c.id,
  'Cửa chớp nhôm ngang hệ 80',
  'cua-chop-nhom-ngang-he-80',
  'LCN-H80',
  'Nan ngang hệ 80mm, phù hợp ban công và mặt tiền nhà phố.',
  'Sản phẩm cửa chớp nhôm ngang hệ 80 có thiết kế chắc chắn, thoáng gió và phù hợp phong cách kiến trúc hiện đại.',
  '{"Độ dày nhôm": "1.2mm - 1.6mm", "Bề mặt": "Sơn tĩnh điện", "Bảo hành": "24 tháng"}'::jsonb,
  1450000,
  'published',
  true,
  1,
  'Cửa chớp nhôm ngang hệ 80',
  'Cửa chớp nhôm ngang hệ 80 cho ban công, mặt tiền, bền đẹp và tối ưu thông gió.'
from public.product_categories c
where c.slug = 'cua-chop-nhom-ngang'
on conflict (slug) do nothing;

insert into public.blog_categories (name, slug, description, sort_order)
values
  ('Kỹ thuật', 'ky-thuat', 'Bài viết kỹ thuật về cửa chớp nhôm và vật liệu.', 1),
  ('Tư vấn', 'tu-van', 'Kinh nghiệm chọn cửa chớp nhôm cho từng công trình.', 2)
on conflict (slug) do nothing;

insert into public.projects (
  title,
  slug,
  client_name,
  location,
  area,
  project_type,
  completion_date,
  description,
  status,
  is_featured,
  meta_title,
  meta_description
)
values (
  'Biệt thự Thủ Đức 2024',
  'biet-thu-thu-duc-2024',
  'Khách hàng cá nhân',
  'TP. Thủ Đức, TP.HCM',
  '120m2',
  'Biệt thự',
  '2024-11-20',
  'Thi công hệ cửa chớp nhôm cho ban công và khu vực mặt tiền biệt thự.',
  'published',
  true,
  'Dự án biệt thự Thủ Đức 2024',
  'Dự án thi công cửa chớp nhôm cho biệt thự tại TP. Thủ Đức.'
)
on conflict (slug) do nothing;

insert into public.site_settings (key, value, label)
values
  ('company_info', '{"name": "Cửa Chớp Nhôm", "phone": "0900 000 000", "email": "contact@example.com", "address": "TP. Hồ Chí Minh, Việt Nam"}'::jsonb, 'Thông tin công ty'),
  ('seo_defaults', '{"titleTemplate": "%s | Cửa Chớp Nhôm Cao Cấp", "defaultTitle": "Cửa Chớp Nhôm Cao Cấp", "defaultDescription": "Tư vấn, thiết kế và thi công cửa chớp nhôm cao cấp."}'::jsonb, 'SEO mặc định')
on conflict (key) do nothing;
