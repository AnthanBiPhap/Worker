-- Extend admin profiles for TailAdmin User Profile page.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists job_title text,
  add column if not exists bio text,
  add column if not exists country text,
  add column if not exists city_state text,
  add column if not exists postal_code text,
  add column if not exists tax_id text,
  add column if not exists facebook_url text,
  add column if not exists x_url text,
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text;

update public.profiles
set
  first_name = coalesce(first_name, split_part(coalesce(full_name, 'Admin User'), ' ', 1)),
  last_name = coalesce(
    last_name,
    nullif(trim(regexp_replace(coalesce(full_name, 'Admin User'), '^\S+\s*', '')), ''),
    'User'
  ),
  job_title = coalesce(job_title, 'Administrator'),
  bio = coalesce(bio, 'Administrator'),
  country = coalesce(country, 'Vietnam'),
  city_state = coalesce(city_state, 'Ho Chi Minh City, Vietnam'),
  postal_code = coalesce(postal_code, ''),
  tax_id = coalesce(tax_id, ''),
  avatar_url = coalesce(avatar_url, '/images/user/owner.jpg')
where role in ('super_admin', 'admin', 'editor', 'viewer');
