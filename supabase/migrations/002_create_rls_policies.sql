-- Helper: role & barber_id user saat ini (security definer agar tidak rekursif di RLS)
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status <> 'inactive'
$$;

create or replace function public.my_barber_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.barbers where profile_id = auth.uid()
$$;

alter table public.shop_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.transactions enable row level security;
alter table public.whatsapp_sessions enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.shop_sessions enable row level security;

-- shop_settings: semua staff baca, owner ubah
create policy "settings_read" on public.shop_settings for select using (app_role() is not null);
create policy "settings_owner_write" on public.shop_settings for all using (app_role() = 'owner') with check (app_role() = 'owner');

-- profiles: user baca profil sendiri; owner kelola semua. Kasir boleh baca daftar (tanpa kapster lain tidak perlu)
create policy "profiles_self_read" on public.profiles for select using (id = auth.uid());
create policy "profiles_owner_all" on public.profiles for all using (app_role() = 'owner') with check (app_role() = 'owner');
create policy "profiles_admin_read" on public.profiles for select using (app_role() = 'admin');

-- barbers: owner & admin baca/tulis (admin hanya baca); kapster baca dirinya
create policy "barbers_owner_all" on public.barbers for all using (app_role() = 'owner') with check (app_role() = 'owner');
create policy "barbers_admin_read" on public.barbers for select using (app_role() = 'admin');
create policy "barbers_self_read" on public.barbers for select using (id = my_barber_id());

-- services: semua staff baca, owner kelola
create policy "services_read" on public.services for select using (app_role() is not null);
create policy "services_owner_write" on public.services for all using (app_role() = 'owner') with check (app_role() = 'owner');

-- bookings
create policy "bookings_owner_admin_all" on public.bookings for all
  using (app_role() in ('owner','admin')) with check (app_role() in ('owner','admin'));
create policy "bookings_barber_read" on public.bookings for select
  using (app_role() = 'barber' and barber_id = my_barber_id());

-- customers
create policy "customers_owner_admin_all" on public.customers for all
  using (app_role() in ('owner','admin')) with check (app_role() in ('owner','admin'));
create policy "customers_barber_read" on public.customers for select
  using (app_role() = 'barber' and exists (
    select 1 from public.bookings b where b.customer_id = customers.id and b.barber_id = my_barber_id()));

-- transactions (komisi ada di kolom commission_amount)
create policy "transactions_owner_admin_all" on public.transactions for all
  using (app_role() in ('owner','admin')) with check (app_role() in ('owner','admin'));
create policy "transactions_barber_read" on public.transactions for select
  using (app_role() = 'barber' and barber_id = my_barber_id());

-- shop_sessions: owner & admin
create policy "shop_sessions_owner_admin" on public.shop_sessions for all
  using (app_role() in ('owner','admin')) with check (app_role() in ('owner','admin'));

-- whatsapp_messages: owner baca. whatsapp_sessions: tanpa policy = hanya service role (webhook)
create policy "wa_messages_owner_read" on public.whatsapp_messages for select using (app_role() = 'owner');
