# AGENTS.md — Admin UI Components

Panduan saat bekerja di `admin/src/lib/components`.

## Ringkasan & Tujuan

Pustaka komponen antarmuka pengguna dashboard admin.

## Komponen Kunci

- `chat/ChatWidget.svelte` — Komponen melayang untuk live chat WA pelanggan.
- `ui/DataTable.svelte` — Komponen tabel dengan sort, search, pagination.
- `ui/Modal.svelte` — Wrapper dialog interaktif.

## Konvensi & Best Practices

- Wajib handle unmount listener Socket.io di komponen real-time via `onDestroy`.
- Wajib menggunakan Svelte 5 snippets & runes, hindari Svelte 4 `<slot>`.
