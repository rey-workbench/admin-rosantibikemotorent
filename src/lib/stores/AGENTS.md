# AGENTS.md — Admin State Management

Panduan saat bekerja di `admin/src/lib/stores`.

## Ringkasan & Tujuan

State global untuk data yang dibagikan antar komponen halaman admin.

## Komponen Kunci

- `auth.ts` — Menyimpan profil admin dan status login.
- `toast.ts` — Sistem notifikasi melayang (Success/Error).
- `websocket.ts` — Status realtime koneksi socket (Connected/Reconnecting/Disconnected).

## Konvensi & Best Practices

- Prioritaskan penggunaan Runes (Svelte 5) jika memungkinkan.
