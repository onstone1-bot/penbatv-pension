insert into public.accommodations (id, name, area, address, concept, rating, review_count)
values (
  'baebang-alps',
  '배방알프스',
  '충남 아산 배방',
  '충남 아산시 배방읍 고불로231번길 38',
  '수철저수지를 마주 보는 독채와 소나무 정원 속 글램핑',
  4.8,
  126
)
on conflict (id) do update set
  name = excluded.name,
  area = excluded.area,
  address = excluded.address,
  concept = excluded.concept,
  rating = excluded.rating,
  review_count = excluded.review_count;

insert into public.rooms (
  id, accommodation_id, name, type, base_price, weekend_extra,
  standard_capacity, max_capacity, description, tags, amenities
)
values
  (
    'A', 'baebang-alps', '독채펜션', 'private_house', 250000, 100000,
    6, 10, '저수지 통창 목조 독채와 개별 바비큐장을 갖춘 단체형 공간',
    array['수철저수지 통창', '화목난로', '바비큐'],
    '[{"icon":"fire","name":"화목난로"},{"icon":"microphone","name":"노래방 음향"}]'::jsonb
  ),
  (
    'B', 'baebang-alps', '돔 글램핑', 'glamping', 180000, 60000,
    2, 4, '소나무 정원 속 개별 화로대가 있는 돔 글램핑',
    array['돔 글램핑', '개별 화로대', '불멍'],
    '[{"icon":"fire","name":"개별 화로대"},{"icon":"tree","name":"소나무 정원"}]'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  base_price = excluded.base_price,
  weekend_extra = excluded.weekend_extra,
  standard_capacity = excluded.standard_capacity,
  max_capacity = excluded.max_capacity,
  description = excluded.description,
  tags = excluded.tags,
  amenities = excluded.amenities;

insert into public.room_images (room_id, url, caption, sort_order, is_cover)
values
  ('A', 'https://example.com/staylink/rooms/a-cover.jpg', '독채펜션 통창 거실', 1, true),
  ('A', 'https://example.com/staylink/rooms/a-bbq.jpg', '독채펜션 개별 바비큐', 2, false),
  ('B', 'https://example.com/staylink/rooms/b-cover.jpg', '돔 글램핑 전경', 1, true),
  ('B', 'https://example.com/staylink/rooms/b-fire.jpg', '돔 글램핑 개별 화로대', 2, false)
on conflict (room_id, url) do update set
  caption = excluded.caption,
  sort_order = excluded.sort_order,
  is_cover = excluded.is_cover;

insert into public.room_rates (
  room_id, start_date, end_date, rate_type, nightly_price, weekend_extra, priority, memo
)
values
  ('A', '2026-01-01', '2026-12-31', 'base', 250000, 100000, 0, '독채펜션 기본 요금'),
  ('B', '2026-01-01', '2026-12-31', 'base', 180000, 60000, 0, '돔 글램핑 기본 요금'),
  ('A', '2026-07-15', '2026-08-31', 'seasonal', 300000, 120000, 10, '여름 성수기'),
  ('B', '2026-07-15', '2026-08-31', 'seasonal', 220000, 80000, 10, '여름 성수기')
on conflict (room_id, start_date, end_date, rate_type, priority) do update set
  nightly_price = excluded.nightly_price,
  weekend_extra = excluded.weekend_extra,
  memo = excluded.memo;

insert into public.booking_options (id, accommodation_id, name, description, price, sort_order)
values
  ('bbq', 'baebang-alps', '참숯 바비큐 세트', '참숯, 그릴, 집게 포함', 30000, 1),
  ('fire', 'baebang-alps', '불멍 장작 세트', '장작 10kg, 착화제 포함', 15000, 2),
  ('early', 'baebang-alps', '얼리 체크인', '13시 입실', 20000, 3)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  sort_order = excluded.sort_order;

insert into public.youtube_campaigns (code, title, room_id, coupon_amount)
values
  ('campheaven_room_01', '캠핑천국식 룸투어', 'A', 10000),
  ('campheaven_bbq_01', '바비큐·불멍 실사용 리뷰', 'B', 10000),
  ('campheaven_route_01', '처음 방문 동선 안내', 'A', 10000)
on conflict (code) do update set
  title = excluded.title,
  room_id = excluded.room_id,
  coupon_amount = excluded.coupon_amount;
