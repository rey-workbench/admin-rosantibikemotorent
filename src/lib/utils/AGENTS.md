# AGENTS.md — Admin Utilities

Panduan saat bekerja di `admin/src/lib/utils`.

## Ringkasan & Tujuan

Fungsi bantuan global untuk dashboard admin.

## Komponen Kunci

- `format.ts` — Formatting Rupiah (`IDR`).
- `date.ts` — Manipulasi dan formatting tanggal dengan date-fns.
- `storage.ts` — Safe wrapper untuk LocalStorage akses.

## Konvensi & Best Practices

- Lakukan JSON try-catch parsing yang aman di fungsi storage.
