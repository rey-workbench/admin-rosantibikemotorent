# Admin Dashboard - Overview

## Daftar Halaman

---

### 1. Dashboard (`/`)

Pada halaman dashboard, admin bisa melihat:
- Ringkasan jumlah unit motor yang tersedia
- Jumlah transaksi yang sudah selesai
- Persentase efisiensi (transaksi selesai vs total unit)
- Grafik performa 7 hari terakhir (naik/turunnya transaksi per hari)
- Daftar transaksi terbaru dengan status masing-masing

**Catatan:** Data langsung diambil semuanya, belum ada pagination. Chart di-render manual pakai SVG.

---

### 2. Login (`/login`)

Pada halaman login, admin bisa:
- Masuk dengan username dan password
- Checklist "Ingat saya" (fitur belum berfungsi - hanya UI)
- Redirect otomatis ke dashboard kalau sudah login

**Catatan:** Error validasi belum muncul ke user (hanya di console).

---

### 3. Jenis Motor (`/motor`)

Pada halaman jenis motor, admin bisa:
- Melihat daftar semua jenis motor (merk, model, CC, harga sewa per hari)
- Cari motor berdasarkan merk atau model
- Tambah jenis motor baru (isi merk, model, CC, harga sewa, upload gambar)
- Edit jenis motor yang ada
- Hapus jenis motor (konfirmasi dulu)

**Flow:** Buka list → Klik tambah/edit → Isi form → Simpan → Balik ke list

---

### 4. Unit Motor (`/motor/unit`)

Pada halaman unit motor, admin bisa:
- Melihat semua unit motor (plat nomor), dikelompokkan per merk
- Tambah unit motor baru (pilih jenis motor dulu, isi plat nomor, tahun)
- Edit unit motor
- Hapus unit motor
- Lihat harga sewa per unit

Sama pattern dengan halaman Jenis Motor.

---

### 5. Transaksi (`/transaksi`)

Pada halaman transaksi, admin bisa:
- Melihat semua transaksi sewa
- Filter berdasarkan status (semua / pending / aktif / selesai / overdue)
- Buat transaksi baru
- Klik lihat detail (buka invoice)
- Tandai selesai (untuk transaksi yang sedang aktif/overdue)
- Hapus transaksi

**Status transaksi:** Pending, Aktif, Selesai, Overdue, Pending DP, DP Dibayar, Lunas, Batal

**Catatan:** Filter langsung reload data (perlu debounce).

---

### 6. Buat Transaksi (`/transaksi/new`)

Pada halaman buat transaksi, admin bisa:
- Isi data penyewa (nama lengkap, nomor WhatsApp)
- Pilih motor yang tersedia (dropdown)
- Pilih tanggal mulai dan selesai
- Pilih jam mulai dan selesai
- Tambah helm tambahan (0-2)
- Tambah jas hujan tambahan (0-2)
- Klik "Hitung Estimasi" untuk lihat total biaya
- Simpan transaksi

**Catatan:** Hanya motor dengan status "TERSEDIA" yang muncul di list. Estimasi wajib dihitung sebelum simpan.

---

### 7. Detail Transaksi / Invoice (`/transaksi/[id]`)

Pada halaman detail transaksi, admin bisa:
- Lihat invoice lengkap (nama penyewa, motor, tanggal, rincian biaya)
- Print invoice (tombol Cetak Invoice - membuka print dialog)
- Lihat QRIS untuk pembayaran (kalau status PENDING)
- Lihat status sudah lunas atau belum

**Invoice berisi:**
- Nama perusahaan: ROSANTIBIKE MOTORENT
- Alamat dan kontak
- Data penyewa dan motor
- Rincian biaya (sewa, helm free, jas hujan free)
- Status pembayaran
- QR Code QRIS (kalau belum lunas)

---

### 8. Blog (`/blog`)

Pada halaman blog, admin bisa:
- Melihat semua artikel
- Filter berdasarkan status (Published/Draft)
- Tulis artikel baru
- Edit artikel
- Hapus artikel

Sama pattern dengan halaman Jenis Motor.

---

### 9. WhatsApp (`/whatsapp`)

Pada halaman WhatsApp, admin bisa:

**Tab Koneksi:**
- Cek status koneksi WhatsApp (connected/ disconnect/connecting)
- Klik "Get QR" untuk dapat QR Code
- Scan QR dengan HP untuk koneksi
- Reset sesi (kalau bermasalah)
- Logout (putus koneksi)

**Tab Templates:**
- Kelola pesan template yang bisa dikirim

**Tab Workflows:**
- Buat workflow automasi (auto reply, auto booking, dll)

**Fitur Tersedia:**
- WhatsApp Chat Widget melayang (bisa chatting sama customer)
- Notifikasi real-time kalau ada booking baru via WhatsApp

**Catatan:** WhatsApp dan Websocket sudah terintegrasi. Socket connection indicator ada.

---

### 10. Settings (`/settings`)

Pada halaman settings, admin bisa:
- Edit nama website
- Edit deskripsi
- Edit nomor telepon
- Edit email
- Edit alamat lengkap
- Klik "Simpan Pengaturan"

**Catatan:** ⚠️ UI sudah ada, tapi API belum terhubung. Tombol simpan hanya simulate success (todo).

---

### 11. Kelola Admin (`/admin`)

Pada halaman kelola admin, admin bisa:
- Melihat daftar semua admin
- Tambah admin baru (isi username, nama, email, password)
- Edit data admin
- Hapus admin

---

### 12. Queue Monitor (`/queue`)

Pada halaman queue monitor, admin bisa:
- Melihat semua queue yang berjalan (whatsapp, email, dll)
- Lihat jumlah job per queue: waiting, active, completed, failed, delayed
- Pause/Resume queue
- Clean queue (hapus semua job di queue itu)
- Real-time updates via WebSocket

**Catatan:** Berguna buat debugging. Queue ada: whatsapp, email, dll.

---

### 13. AI Playground (`/ai`)

Pada halaman AI, admin bisa:

**Tab AI Playground:**
- Chat simulator untuk test respons bot sepertiWhatsApp
- Toggle WNA mode (kalau customer luar Indonesia)
- Lihat debug info - knowledge base matches yang dipake
- Lihat format pesan WhatsApp (bold, italic, code)

**Tab Knowledge Base:**
- Melihat semua FAQ yang dikenali bot
- Tambah knowledge baru (question + answer + kategori)
- Edit knowledge yang ada
- Hapus knowledge
- Cari knowledge

**Kategorinya:** Syarat & Ketentuan, Fasilitas, Lokasi & Antar Jemput, Pembayaran, Denda & Telat, Umum

**Cara Kerja Bot:**
1. Customer kirim pertanyaan
2. Bot cari knowledge yang paling match
3. AI gabungin sama conversation context
4. Bot balikin respons yang sopan

**Catatan:** Fitur inti! Parsing WhatsApp format masih ada di dalam file ini (500+ baris).

---

### 14. Availability Calendar (`/availability`)

Pada halaman availability calendar, admin bisa:
- Melihat kalender ketersediaan per bulan
- Navigasi bulan (tombol kiri/kanan)
- Filter per merek motor
- Hover tanggal untuk lihat siapa yang booking
- Tooltip menampilkan detail penyewa

**Visual:**
- Hijau = Tersedia (klik untuk booking)
- Merah = Sedang disewa atau overdue
- Abu-abu = Service atau tidak diketahui

---

## Components yang Tersedia

| Component | Gunanya |
|-----------|--------|
| `Card` | Card/wrapper |
| `Button` | Tombol (primary/secondary/danger/success/warning) |
| `Input` | Input teks dengan label |
| `Select` | Dropdown |
| `DataTable` | Tabel data |
| `Badge` | Status badges |
| `Modal` | Popup dialog |
| `Loading` | Spinner loading |
| `EmptyState` | Kalau data kosong |
| `Form` | Wrapper form (include back button + submit) |
| `Toast` | Notifikasi sukses/error |
| `ConfirmModal` | Dialog konfirmasi (untuk hapus dll) |
| `FileUpload` | Upload file/gambar |
| `Alert` | Alert messages |
| `Tabs` | Tab navigation |

---

## Patterns yang Dipakai

**Yang Bagus:**
- Form wrapper pattern (otomatis back + submit button)
- Confirm dialog untuk aksi berbahaya (hapus)
- Toast untuk feedback sukses/error
- Reactive filtering
- WebSocket untuk real-time updates

**Yang Perlu Dibiarkan/Benerin:**
- Settings - UI ada, API belum
- Pagination belum ada (ambil 100 sekaligus)
- Filter debouncing belum ada (langsung reload)
- Error handling console.error doang (belum ada toast)
- Pakai $app/stores dan $state campur-aduk

---

## Fitur yang Belum Ada / Minus

1. **Settings** - UI sudah, API belum
2. **Pagination** - Semua list ambil 100 sekaligus
3. **Debounce search** - Langsung search waktu ketik
4. **Bulk actions** - Delete satu-satu
5. **Export CSV/Excel** - Belum ada
6. **Laporan keuangan** - Belum ada
7. **Email notification** - Belum ada

---

*Generated: 2026-04-19*