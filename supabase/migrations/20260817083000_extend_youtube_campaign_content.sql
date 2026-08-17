alter table public.youtube_campaigns
  add column if not exists category text not null default 'all' check (category in ('all', 'exterior', 'interior')),
  add column if not exists tag text not null default 'YouTube',
  add column if not exists description text,
  add column if not exists thumbnail_url text;

update public.youtube_campaigns
set
  category = coalesce(category, 'all'),
  tag = coalesce(nullif(tag, ''), 'YouTube');
