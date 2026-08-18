create table if not exists public.naver_links (
  id text primary key,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  room_id text references public.rooms(id) on delete set null,
  link_type text not null check (link_type in ('blog', 'review')),
  title text not null,
  url text not null,
  author text,
  excerpt text,
  rating numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  published_at date,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists naver_links_accommodation_sort_idx
on public.naver_links(accommodation_id, sort_order);

create index if not exists naver_links_room_id_idx
on public.naver_links(room_id);

alter table public.naver_links enable row level security;

drop policy if exists "anon can read active naver links" on public.naver_links;
create policy "anon can read active naver links"
on public.naver_links for select to anon
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = naver_links.accommodation_id
    and a.status = 'active'
  )
);

grant select on public.naver_links to anon;
grant select, insert, update, delete on public.naver_links to service_role;
