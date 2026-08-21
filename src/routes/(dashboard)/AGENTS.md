# AGENTS.md — Admin Dashboard Routes

Panduan saat bekerja di `admin/src/routes/(dashboard)`.

## Ringkasan & Tujuan

Routing halaman operasional dasbor admin.

## Komponen Kunci

- `/` (`+page.svelte`) — Halaman ringkasan (omset, armada aktif, grafik booking).
- `/transaksi/` — Tabel pemrosesan sewa motor, alokasi unit fisik, dan konfirmasi pembayaran.
- `/unit-motor/` — Daftar inventaris pelat nomor motor fisik.
- `/jenis-motor/` — Katalog tipe motor beserta setting harga sewa dasar.

## Konvensi & Best Practices

- Gunakan file `+page.server.ts` atau load functions untuk memuat data di awal jika diperlukan SSR.
