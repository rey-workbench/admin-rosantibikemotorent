# AGENTS.md — Admin API Layer

Panduan saat bekerja di `admin/src/lib/api`.

## Ringkasan & Tujuan

Client HTTP dashboard admin untuk komunikasi dengan NestJS backend.

## Komponen Kunci

- `client.ts` — Centralized fetch dengan interceptor token & auto-refresh (401).
- `auth.ts` — Login & manajemen sesi.
- `transaksi.ts` — Fetch data booking, update status (CONFIRMED, RENTED, COMPLETED).
- `whatsapp.ts` — Fetch QR Code, status koneksi, dan kirim pesan.

## Konvensi & Best Practices

- Semua fungsi API wajib mengembalikan `Promise<ApiResponse<T>>`.
- Tangani error HTTP di catch block sentral.
