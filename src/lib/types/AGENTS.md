# AGENTS.md — Admin TypeScript Types

Panduan saat bekerja di `admin/src/lib/types`.

## Ringkasan & Tujuan

Definisi kontrak antarmuka dan tipe data untuk dashboard admin.

## Komponen Kunci

- `api.ts` — Generic `ApiResponse<T>`.
- `transaksi.ts` — DTO dan interface status (PENDING_DP, CONFIRMED).
- `whatsapp.ts` — Tipe data pesan, status sesi WA.

## Konvensi & Best Practices

- Sinkronisasi tipe data ini secara manual dengan DTO dan entity backend.
