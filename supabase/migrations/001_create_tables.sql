create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- Pengaturan barbershop (1 baris, 1 outlet)
create table public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null default 'BarberFlow Demo',
  app_display_name text not null default 'BarberFlow',
  address text,
  open_time time not null default '10:00',
  close_time time not null default '21:00',
  owner_whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null default 'barber' check (role in ('owner','admin','barber')),
  phone text,
  status text not null default 'active' check (status in ('active','off','inactive')),
  work_start_time time not null default '10:00',
  work_end_time time not null default '21:00',
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  is_active boolean not null default true,
  work_start_time time not null default '10:00',
  work_end_time time not null default '21:00',
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  commission_type text not null default 'percent' check (commission_type in ('percent','fixed')),
  commission_value numeric not null default 0 check (commission_value >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_number text unique,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  barber_id uuid not null references public.barbers(id),
  service_id uuid not null references public.services(id),
  booking_date date not null,
  booking_time time not null,
  end_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no_show')),
  source text not null check (source in ('whatsapp','walk_in')),
  queue_status text check (queue_status in ('waiting','serving','done','cancelled')),
  created_at timestamptz not null default now(),
  -- Cegah double booking: slot WhatsApp yang aktif tidak boleh tumpang tindih untuk kapster yang sama
  constraint no_double_booking exclude using gist (
    barber_id with =,
    tsrange((booking_date + booking_time), (booking_date + end_time)) with &&
  ) where (status = 'scheduled' and source = 'whatsapp')
);
create index bookings_date_idx on public.bookings (booking_date);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id),
  barber_id uuid not null references public.barbers(id),
  service_id uuid not null references public.services(id),
  total_amount numeric not null,
  payment_method text not null check (payment_method in ('cash','qris','transfer')),
  commission_amount numeric not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text unique not null,
  current_step text not null default 'idle',
  temp_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  direction text not null check (direction in ('inbound','outbound')),
  message_body text not null,
  message_type text not null default 'text',
  created_at timestamptz not null default now()
);

create table public.shop_sessions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shop_settings(id),
  opened_by uuid not null references public.profiles(id),
  opened_at timestamptz not null default now(),
  closed_by uuid references public.profiles(id),
  closed_at timestamptz,
  status text not null default 'open' check (status in ('open','closed')),
  total_bookings integer not null default 0,
  total_walk_ins integer not null default 0,
  total_revenue numeric not null default 0,
  total_commission numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- Realtime untuk antrean di dashboard
alter publication supabase_realtime add table public.bookings;
