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
  ('bbq-set', 'baebang-alps', '참숯 바베큐 세트', '참숯, 그릴, 집게 포함', 30000, 1),
  ('firewood', 'baebang-alps', '불멍 장작 세트', '장작 10kg 기준', 15000, 2),
  ('early-checkin', 'baebang-alps', '얼리 체크인', '13시 입실 옵션', 20000, 3),
  ('bbq-only', 'baebang-alps', '바베큐장 단독 이용', '숙박 없이 바베큐장만 이용', 50000, 4)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  sort_order = excluded.sort_order;

insert into public.youtube_campaigns (
  code, title, video_url, room_id, category, tag, description, thumbnail_url, coupon_amount
)
values
  (
    'campheaven_room_01',
    '배방알프스 전체 공간 소개',
    'https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC',
    'A',
    'all',
    '대표 영상',
    '입구, 주차, 방 내부, 개별 바비큐 동선을 영상처럼 먼저 확인',
    'https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_reservoir_01',
    '저수지 전망과 외부 동선 쇼츠',
    'https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34',
    'A',
    'exterior',
    '외부',
    '저수지 전망, 진입로, 마당 분위기를 짧은 영상으로 확인',
    'https://img.youtube.com/vi/SLUDFGDzoZ4/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_bbq_01',
    '바베큐 마당 동선 쇼츠',
    'https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS',
    'B',
    'exterior',
    '인기 쇼츠',
    '저녁 조리 동선과 화로대 간격을 보고 바로 예약으로 연결',
    'https://img.youtube.com/vi/lVz-IlPW6VQ/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_glamping_01',
    '글램핑 감성 공간 쇼츠',
    'https://youtube.com/shorts/BMnTeq-tTO4?si=ykqRHyCeiKGHtFUt',
    'B',
    'exterior',
    '외부',
    '돔 글램핑과 야외 데크, 소나무 정원 분위기를 먼저 확인',
    'https://img.youtube.com/vi/BMnTeq-tTO4/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_room_inside_01',
    '객실 내부 미리보기 쇼츠',
    'https://youtube.com/shorts/PkQPdz4WHps?si=9_eRkV4G0koGCuUF',
    'A',
    'interior',
    '내부',
    '거실, 통창, 목조 인테리어, 가족방 구조를 객실 선택 전에 확인',
    'https://img.youtube.com/vi/PkQPdz4WHps/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_bbq_night_01',
    '야외 바베큐 감성 쇼츠',
    'https://youtube.com/shorts/FMibcJCCSx8?si=FWKicOupJBEzLghE',
    'B',
    'exterior',
    '외부',
    '바비큐장 테이블, 화로대, 저녁 분위기를 예약 전에 확인',
    'https://img.youtube.com/vi/FMibcJCCSx8/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_route_01',
    '간판과 진입로 쇼츠',
    'https://youtube.com/shorts/KDs0V0NGYTA?si=73c1245O_7C7GvL8',
    'A',
    'exterior',
    '처음 방문',
    '체크인, 샤워실, 분리수거, 주변 산책 코스를 짧게 확인',
    'https://img.youtube.com/vi/KDs0V0NGYTA/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_tour_01',
    '배방알프스 공간 투어',
    'https://youtu.be/prvj3pzAokA?si=4xrKXIZZD1Ppu_Xf',
    'A',
    'all',
    '전체',
    '전체 시설을 둘러본 뒤 고객 홈에서 원하는 객실로 이동',
    'https://img.youtube.com/vi/prvj3pzAokA/hqdefault.jpg',
    10000
  ),
  (
    'campheaven_guide_01',
    '바베큐장 이용 안내 영상',
    'https://youtu.be/auNckmC4O1s?si=QRqRTmdQ8xgOeYFT',
    'B',
    'interior',
    '내부',
    '객실 이용 안내와 바비큐장 예약 전 확인해야 할 이용 기준',
    'https://img.youtube.com/vi/auNckmC4O1s/hqdefault.jpg',
    10000
  )
on conflict (code) do update set
  title = excluded.title,
  video_url = excluded.video_url,
  room_id = excluded.room_id,
  category = excluded.category,
  tag = excluded.tag,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  coupon_amount = excluded.coupon_amount;
