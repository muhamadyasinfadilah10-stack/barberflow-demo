# Setup Supabase

1. **Project**: buat di supabase.com. Settings → API: salin `Project URL`, `anon key`, `service_role key` ke `.env.local`.
2. **Database**: SQL Editor → jalankan `001`, `002`, `003` berurutan.
3. **Owner pertama**: Authentication → Users → Add user (centang Auto Confirm). Lalu jalankan:
   ```sql
   insert into public.profiles (id, full_name, email, role)
   select id, 'Nama Owner', email, 'owner' from auth.users where email = 'email-owner@contoh.com';
   ```
4. **Realtime**: file 001 sudah mendaftarkan tabel `bookings` ke publication `supabase_realtime`.
5. **Reset password**: Authentication → Email Templates → *Reset Password*. Ganti link menjadi:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Buat password baru</a>
   ```
   Authentication → URL Configuration: isi *Site URL* sama dengan `NEXT_PUBLIC_SITE_URL`.
   Template ini juga dipakai saat owner mengirim reset password untuk karyawan.
6. Karyawan baru dibuat dari halaman **Karyawan** (owner), tidak perlu lewat dashboard Supabase.
