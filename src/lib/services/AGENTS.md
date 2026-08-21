# AGENTS.md — Admin Services Layer

Panduan saat bekerja di `admin/src/lib/services`.

## Ringkasan & Tujuan

Layanan singleton dan jembatan event real-time.

## Komponen Kunci

- `websocket.ts` — Koneksi Socket.io persisten ke backend. Broadcast events (`whatsapp:message`, `transaksi:update`).
- `audio.service.ts` — Audio alert saat ada booking baru atau pesan WA baru masuk.

## Konvensi & Best Practices

- Reconnection logic harus handle exponential backoff agar tidak membanjiri server.
