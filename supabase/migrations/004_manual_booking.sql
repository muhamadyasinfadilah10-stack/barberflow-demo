-- Booking manual oleh owner/kasir (source = 'manual'), tetap kebal double booking
alter table public.bookings drop constraint if exists bookings_source_check;
alter table public.bookings add constraint bookings_source_check check (source in ('whatsapp','walk_in','manual'));

alter table public.bookings drop constraint if exists no_double_booking;
alter table public.bookings add constraint no_double_booking exclude using gist (
  barber_id with =,
  tsrange((booking_date + booking_time), (booking_date + end_time)) with &&
) where (status = 'scheduled' and source in ('whatsapp','manual'));
