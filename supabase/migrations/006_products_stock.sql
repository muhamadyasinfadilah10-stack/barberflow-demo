-- Stok produk (pomade, shampoo, dll.)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  type text not null check (type in ('in','sale','use','adjust')),
  quantity integer not null,            -- bertanda: + masuk, - keluar
  stock_after integer not null,
  unit_price numeric,                   -- hanya untuk penjualan
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index stock_movements_product_idx on public.stock_movements (product_id, created_at desc);

alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
create policy "products_read" on public.products for select using (app_role() in ('owner','admin'));
create policy "products_owner_write" on public.products for all using (app_role() = 'owner') with check (app_role() = 'owner');
create policy "stock_movements_read" on public.stock_movements for select using (app_role() in ('owner','admin'));
-- Tidak ada policy insert: pencatatan stok hanya lewat fungsi di bawah (atomik, stok tidak bisa minus)

create or replace function public.record_stock_movement(p_product uuid, p_type text, p_qty integer, p_price numeric, p_note text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_role text := app_role(); v_stock int; v_price numeric; v_delta int; v_new int;
begin
  if v_role is null or v_role not in ('owner','admin') then raise exception 'Anda tidak punya akses' using errcode = '42501'; end if;
  if p_type = 'adjust' and v_role <> 'owner' then raise exception 'Koreksi stok hanya untuk owner' using errcode = '42501'; end if;
  select stock, price into v_stock, v_price from public.products where id = p_product for update;
  if not found then raise exception 'Produk tidak ditemukan' using errcode = 'P0002'; end if;
  if p_type = 'in' then v_delta := p_qty;
  elsif p_type in ('sale','use') then v_delta := -p_qty;
  elsif p_type = 'adjust' then v_delta := p_qty - v_stock;
  else raise exception 'Jenis tidak valid' using errcode = '22023'; end if;
  v_new := v_stock + v_delta;
  if v_new < 0 then raise exception 'Stok tidak cukup (tersisa %)', v_stock using errcode = '23514'; end if;
  update public.products set stock = v_new where id = p_product;
  insert into public.stock_movements (product_id, type, quantity, stock_after, unit_price, note, created_by)
  values (p_product, p_type, v_delta, v_new, case when p_type = 'sale' then coalesce(p_price, v_price) end, nullif(p_note, ''), auth.uid());
  return v_new;
end $$;
revoke execute on function public.record_stock_movement(uuid, text, integer, numeric, text) from public, anon;
grant execute on function public.record_stock_movement(uuid, text, integer, numeric, text) to authenticated;

-- Contoh produk
insert into public.products (name, price, stock, min_stock)
select * from (values ('Pomade', 75000, 12, 5), ('Shampoo', 50000, 20, 5), ('Hair powder', 65000, 8, 3)) v(name, price, stock, min_stock)
where not exists (select 1 from public.products);
