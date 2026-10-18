insert into public.shop_settings (shop_name, app_display_name, address, open_time, close_time, owner_whatsapp_number)
select 'BarberFlow Demo', 'BarberFlow', 'Jl. Contoh No. 1, Jakarta', '10:00', '21:00', '6281234567890'
where not exists (select 1 from public.shop_settings);

insert into public.services (name, price, duration_minutes, commission_type, commission_value) values
  ('Potong rambut', 35000, 30, 'percent', 40),
  ('Potong + Shaving', 55000, 45, 'percent', 40),
  ('Facial', 75000, 60, 'percent', 30),
  ('Coloring', 150000, 90, 'percent', 30),
  ('Cuci rambut', 20000, 15, 'fixed', 5000);

insert into public.barbers (full_name, phone, work_start_time, work_end_time) values
  ('Rizky', '6281111111111', '10:00', '21:00'),
  ('Dimas', '6282222222222', '10:00', '18:00'),
  ('Bayu',  '6283333333333', '13:00', '21:00');

-- Owner pertama: buat user di Supabase Auth (Dashboard > Authentication > Users),
-- lalu jalankan (ganti email):
-- insert into public.profiles (id, full_name, email, role)
-- select id, 'Owner Demo', email, 'owner' from auth.users where email = 'owner@example.com';
