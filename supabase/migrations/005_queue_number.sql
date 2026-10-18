-- Nomor antrean walk-in, berulang dari 1 setiap hari
alter table public.bookings add column if not exists queue_number integer;
create unique index if not exists walkin_queue_number_unique
  on public.bookings (booking_date, queue_number)
  where source = 'walk_in' and queue_number is not null;
