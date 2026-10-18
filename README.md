# BarberFlow Demo

Sistem manajemen barbershop (1 outlet) dengan booking otomatis via WhatsApp. Versi demo gratis.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth, Postgres, RLS) · WhatsApp Cloud API (test number Meta) · Zod

## Fitur
- Booking via chatbot WhatsApp (menu & angka, tanpa AI): `BOOKING`, `JADWAL`, `BATAL`, `BANTUAN`
- Anti double booking dijamin database (exclusion constraint), bukan hanya kode
- Antrean walk-in, transaksi (Tunai/QRIS/Transfer), komisi otomatis
- Laporan harian/rentang tanggal + export CSV
- Role **owner**, **admin/kasir**, **kapster** dengan Supabase RLS
- Manajemen karyawan, pengaturan barbershop, buka/tutup barbershop
- Laporan buka/tutup dikirim lewat link `wa.me` (gratis, tanpa Cloud API)

## Instalasi
```bash
npm install
cp .env.example .env.local   # isi nilainya
npm run dev                  # http://localhost:3000
```
Cek tipe & build: `npm run typecheck && npm run build`.

## Setup Supabase (ringkas, detail di docs/supabase-setup.md)
1. Buat project Supabase. Salin URL, anon key, service role key ke `.env.local`.
2. Jalankan berurutan di SQL Editor: `001_create_tables.sql`, `002_create_rls_policies.sql`, `003_seed_demo_data.sql`.
3. Buat user owner di Authentication → Users, lalu jalankan SQL `insert into public.profiles ...` (ada di akhir file 003).
4. Ubah template email *Reset Password* sesuai docs/supabase-setup.md.

## Setup WhatsApp (ringkas, detail di docs/whatsapp-setup.md)
1. Buat app di developers.facebook.com → tambah produk WhatsApp → pakai test number.
2. Isi `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`.
3. Deploy (atau tunnel `ngrok http 3000`), set Callback URL `https://DOMAIN/api/whatsapp/webhook`, subscribe `messages`.
4. Tanpa HP: pakai **Simulator WhatsApp** di dashboard owner.

## Matriks akses
| Halaman | Owner | Admin/Kasir | Kapster |
|---|---|---|---|
| Dashboard | semua | semua | miliknya |
| Booking | semua | lihat + kelola | jadwal miliknya |
| Antrean walk-in, Transaksi | ✔ | ✔ | ✘ |
| Komisi | semua kapster | ✘ | miliknya |
| Laporan | rentang tanggal | harian saja | ✘ |
| Buka/Tutup | ✔ | ✔ | ✘ |
| Karyawan, Kapster, Layanan, Pengaturan | ✔ | ✘ | ✘ |

Akses dijaga di tiga lapis: middleware (wajib login), cek role di tiap halaman/API, dan RLS di database.

## Catatan keamanan
- `SUPABASE_SERVICE_ROLE_KEY` dan `WHATSAPP_TOKEN` hanya dipakai di kode server (`lib/supabase/admin.ts` memakai `server-only`).
- Webhook belum memverifikasi tanda tangan `X-Hub-Signature-256`. Tambahkan sebelum produksi.
- Tipe `supabase/types/database.types.ts` masih placeholder; generate dengan `supabase gen types`.
