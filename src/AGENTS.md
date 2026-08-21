# AGENTS.md — Admin Source Architecture

Panduan saat bekerja di `admin/src`.

## Ringkasan & Tujuan

Pusat kode dashboard admin SvelteKit.

## Komponen Kunci

- `lib/api/` — Client HTTP untuk integrasi backend.
- `lib/components/` — UI komponen reusable (ChatWidget, Modal, Table).
- `lib/services/` — Singleton services (WebSocket, Audio).
- `lib/stores/` — Global state management (Auth, Toast).
- `routes/(dashboard)/` — Routing halaman admin (Overview, Transaksi, Unit Motor).

## Konvensi & Best Practices

- Hindari state global yang tidak perlu, gunakan context atau runes secukupnya.
