-- Run this file in the Supabase SQL Editor before using /admin/gallery.

create table if not exists public.gallery_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.gallery_admins enable row level security;

create or replace function public.is_gallery_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gallery_admins
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_gallery_admin() to anon, authenticated;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null unique,
  title text not null check (char_length(title) between 1 and 140),
  location text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_public_order_idx
  on public.gallery_items (is_published, sort_order, created_at);

alter table public.gallery_items enable row level security;

create policy "Published gallery items are public"
  on public.gallery_items for select
  using (is_published = true);

create policy "Gallery admins can read all gallery items"
  on public.gallery_items for select to authenticated
  using (public.is_gallery_admin());

create policy "Gallery admins can add gallery items"
  on public.gallery_items for insert to authenticated
  with check (public.is_gallery_admin());

create policy "Gallery admins can update gallery items"
  on public.gallery_items for update to authenticated
  using (public.is_gallery_admin())
  with check (public.is_gallery_admin());

create policy "Gallery admins can delete gallery items"
  on public.gallery_items for delete to authenticated
  using (public.is_gallery_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Gallery images are public"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Gallery admins can manage gallery images"
  on storage.objects for all to authenticated
  using (bucket_id = 'gallery' and public.is_gallery_admin())
  with check (bucket_id = 'gallery' and public.is_gallery_admin());

-- Create the owner in Supabase Authentication first, then run this once with that user's UUID:
-- insert into public.gallery_admins (user_id) values ('PASTE-THE-OWNER-USER-ID-HERE');
