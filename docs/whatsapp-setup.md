# Setup WhatsApp Cloud API (test number)

1. developers.facebook.com → Create App (tipe Business) → tambah produk **WhatsApp**.
2. Menu WhatsApp → API Setup: salin **Phone number ID** dan **Temporary access token** (berlaku ±24 jam; untuk demo panjang buat System User token).
3. Daftarkan nomor HP penerima (HP Anda/owner) di kolom *To* agar bisa menerima pesan dari test number.
4. Isi `.env.local`: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, dan `WHATSAPP_VERIFY_TOKEN` (teks bebas buatan Anda).
5. Webhook: WhatsApp → Configuration → Callback URL `https://DOMAIN/api/whatsapp/webhook`, Verify token sama dengan `.env`. Lalu subscribe field **messages**.
   Lokal: jalankan `ngrok http 3000` dan pakai URL https dari ngrok.
6. Kirim `BOOKING` dari HP ke test number. Bot membalas menu layanan.

**Catatan:** test number hanya bisa membalas pesan dalam jendela 24 jam sejak pelanggan menulis, sesuai alur chatbot ini.
**Laporan buka/tutup tidak memakai Cloud API**, tetapi link `wa.me` yang dibuka di perangkat karyawan.
