# BUKU PANDUAN PENGGUNA (MANUAL BOOK)

# SISTEM OPERASIONAL DAN MANAJEMEN RENTAL MOTOR

# ROSANTI BIKE MOTORENT

## EDISI REVISI TAHUN 2026

---

## KATA PENGANTAR

Assalamualaikum Warahmatullahi Wabarakatuh,  
Salam Sejahtera untuk Kita Semua,

Puji dan syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas berkah dan karunia-Nya sehingga Buku Panduan Pengguna (Manual Book) Sistem Operasional dan Manajemen Rental Motor Rosanti Bike Motorent Edisi Revisi Tahun 2026 ini dapat diselesaikan dan diterbitkan.

Buku petunjuk teknis ini dirancang secara sistematis dan visual dengan format gambar terpadu: setiap tampilan antarmuka disajikan dalam bentuk gambar nyata dari aplikasi, kemudian tepat di bawahnya diberikan penjelasan fungsi serta langkah-langkah bernomor yang jelas dan mudah dipahami.

Semoga buku panduan ini menjadi pedoman baku yang memperlancar seluruh operasional dan meningkatkan mutu pelayanan prima Rosanti Bike Motorent kepada pelanggan.

Malang, Agustus 2026  
Tim Penyusun & Manajemen Rosanti Bike

---

## DAFTAR ISI

- KATA PENGANTAR - Hal. 1
- DAFTAR ISI - Hal. 2
- BAB 1. PENDAHULUAN & KETENTUAN UMUM - Hal. 3
- BAB 2. AUTENTIKASI DAN LOGIN SISTEM - Hal. 4
- BAB 3. PANDUAN STAF OPERASIONAL & KASIR - Hal. 6
- BAB 4. PANDUAN TIM TEKNIS & CUSTOMER SERVICE AUTOMATION - Hal. 11
- BAB 5. PANDUAN SUPER ADMIN & DATA MASTER - Hal. 17
- BAB 6. STANDAR OPERASIONAL PROSEDUR (SOP) & PENUTUP - Hal. 23

---

## BAB 1. PENDAHULUAN & KETENTUAN UMUM

### 1.1 Latar Belakang & Tujuan Sistem

Sistem Panel Administrasi Rosanti Bike Motorent adalah platform manajemen terpadu berbasis web yang dirancang untuk mengelola seluruh siklus bisnis persewaan motor: pencatatan pesanan, kalender ketersediaan armada, otomatisasi WhatsApp CRM, asisten pintar AI, hingga pengawasan beban server latar belakang.

### 1.2 Ketentuan Hak Akses Pengguna (Role Permission)

Setiap staf memiliki akun pengguna dengan batasan hak akses sesuai tugas operasional:

| Role Pengguna     | Batasan & Wewenang Akses Menu                                                              |
| :---------------- | :----------------------------------------------------------------------------------------- |
| Super Admin       | Akses penuh (100%): Pengaturan Sistem, Data Master, Kelola Admin, WhatsApp, dan Transaksi. |
| Admin Operasional | Akses Transaksi Booking, Kalender Ketersediaan, WhatsApp Bot, dan Katalog Motor.           |
| Staf Kasir        | Akses Pembuatan Transaksi Baru, Pembayaran Kasir, dan Validasi Identitas Penyewa.          |
| Teknisi / Mekanik | Akses Status Kesiapan Fisik Unit, Riwayat Servis, dan Pelaporan Kerusakan.                 |

---

## BAB 2. AUTENTIKASI DAN LOGIN SISTEM

### 2.1 Halaman Masuk Administrator (Login)

Gambar 2.1: Halaman Login Administrator Rosanti Bike

Pada Gambar 2.1, kita dapat melihat halaman awal autentikasi sebelum masuk ke dalam panel admin. Halaman ini berfungsi untuk memverifikasi identitas pengguna resmi.

Untuk mengakses sistem admin, ikuti langkah-langkah berikut:

1. Buka aplikasi browser di komputer Anda (Google Chrome, Microsoft Edge, atau Mozilla Firefox).
2. Ketikkan alamat website admin: https://admin.rosantibikemotorent.com pada kolom pencarian browser.
3. Tunggu hingga layar menampilkan formulir login utama Rosanti Bike.

---

### 2.2 Pengisian Kredensial & Masuk Sistem

Gambar 2.2: Formulir Login Terisi dan Tombol Masuk

Pada Gambar 2.2, kita dapat melihat contoh pengisian email dan kata sandi pengelola pada kolom login.

Untuk melakukan login dan masuk ke panel, ikuti langkah-langkah berikut:

1. Masukkan alamat email akun Anda pada kolom Email (contoh: admin@rosantibike.com).
2. Masukkan kata sandi rahasia Anda pada kolom Password.
3. Klik tombol Masuk ke Panel yang berwarna biru.
4. Sistem akan memeriksa kevalidan data dan secara otomatis mengarahkan Anda ke halaman Dashboard.

---

## BAB 3. PANDUAN STAF OPERASIONAL & KASIR

### 3.1 Dasbor Statistik & Ringkasan Performa Bisnis

Gambar 3.1: Dasbor Statistik & Ringkasan Performa Rental

Pada Gambar 3.1, kita dapat memantau ringkasan statistik sewa motor secara real-time, melihat jumlah motor yang siap disewa, motor yang sedang jalan, total transaksi, serta grafik pendapatan.

Untuk membaca informasi pada Dasbor, ikuti langkah-langkah berikut:

1. Klik menu Dashboard pada bilah menu di sebelah kiri.
2. Periksa 4 kotak ringkasan di bagian atas layar:
   - Total Booking: Menampilkan akumulasi seluruh transaksi sewa yang tercatat.
   - Motor Tersedia: Menunjukkan jumlah armada fisik yang siap disewakan hari ini.
   - Motor Disewa: Menunjukkan jumlah armada yang sedang aktif berada di tangan penyewa.
   - Total Pendapatan: Menampilkan akumulasi penerimaan sewa yang telah lunas.
3. Lihat grafik garis di bagian tengah untuk menganalisis tren transaksi harian dan mingguan.
4. Periksa tabel transaksi terbaru di bagian bawah untuk merespons pesanan sewa pelanggan baru.

---

### 3.2 Mengelola Daftar Transaksi Sewa (Booking)

Gambar 3.2: Halaman Daftar Transaksi Booking & Status Sewa

Pada Gambar 3.2, kita dapat melihat daftar lengkap seluruh pesanan sewa pelanggan, melakukan pencarian data penyewa, memfilter status pesanan, serta mengubah status sewa kendaraan.

Untuk mengelola transaksi booking, ikuti langkah-langkah berikut:

1. Klik menu Transaksi pada bilah menu di sebelah kiri.
2. Gunakan kolom pencarian di bagian atas tabel untuk mencari nama pelanggan, nomor telepon, atau plat nomor motor.
3. Klik tab filter status di atas tabel untuk menyaring pesanan:
   - Pending: Menunggu konfirmasi pembayaran DP dari pelanggan.
   - Confirmed: Pesanan telah dikonfirmasi dan jadwal unit telah terkunci.
   - Active: Kendaraan telah diserahkan dan sedang digunakan oleh pelanggan.
   - Completed: Kendaraan telah dikembalikan dalam kondisi baik dan transaksi selesai.
   - Cancelled: Pesanan dibatalkan.
4. Klik tombol aksi pada baris transaksi untuk melihat rincian pesanan atau mengubah status sewa saat serah terima unit motor.

---

### 3.3 Mengecek Kalender Ketersediaan Motor (Availability Matrix)

Gambar 3.3: Kalender Matriks Ketersediaan Armada Motor Real-Time

Pada Gambar 3.3, kita dapat memantau ketersediaan seluruh unit motor dalam bentuk kalender matriks visual agar tidak terjadi pemesanan ganda (double-booking).

Untuk membaca kalender ketersediaan, ikuti langkah-langkah berikut:

1. Klik menu Ketersediaan pada bilah menu di sebelah kiri.
2. Gunakan tombol panah kiri dan kanan di bagian atas kalender untuk berpindah minggu atau bulan.
3. Perhatikan balok warna jadwal pada masing-masing baris unit motor:
   - Kolom Bersih / Putih: Unit motor kosong dan siap untuk disewa.
   - Balok Biru: Unit motor telah dipesan untuk rentang tanggal tersebut.
   - Balok Kuning: Unit motor sedang digunakan berjalan di lapangan.
   - Balok Abu-Abu: Unit motor sedang dalam jadwal servis atau perbaikan bengkel.
4. Klik pada balok nama pemesan di kalender untuk memunculkan kotak ringkasan data penyewa dan nomor kontak WhatsApp.

---

## BAB 4. PANDUAN TIM TEKNIS & CUSTOMER SERVICE AUTOMATION

### 4.1 Menghubungkan WhatsApp Gateway (Scan QR Code)

Gambar 4.1: Status Koneksi WhatsApp Gateway & Pemindaian QR Code

Pada Gambar 4.1, kita dapat melihat status koneksi nomor WhatsApp resmi Rosanti Bike dan melakukan pemindaian QR Code untuk mengaktifkan bot notifikasi otomatis.

Untuk menghubungkan nomor WhatsApp ke sistem, ikuti langkah-langkah berikut:

1. Klik menu WhatsApp pada bilah menu di sebelah kiri.
2. Pilih tab Status Koneksi di bagian atas halaman.
3. Jika status menunjukkan disconnected, klik tombol hijau Generate QR Code.
4. Buka aplikasi WhatsApp di ponsel operasional kantor.
5. Buka Pengaturan di WhatsApp ponsel, pilih Perangkat Tertaut (Linked Devices), lalu klik Tautkan Perangkat.
6. Arahkan kamera ponsel Anda ke gambar QR Code di layar monitor.
7. Tunggu beberapa detik hingga status di layar berubah menjadi connected berwarna hijau.

---

### 4.2 Mengatur Template Pesan Otomatis WhatsApp

Gambar 4.2: Halaman Pengaturan Template Pesan Otomatis Pelanggan

Pada Gambar 4.2, kita dapat melihat dan mengubah format pesan WhatsApp otomatis yang akan dikirimkan kepada pelanggan (konfirmasi booking, pengingat pengembalian, dan ucapan terima kasih).

Untuk menyunting template pesan, ikuti langkah-langkah berikut:

1. Klik menu WhatsApp, lalu pilih tab Template Pesan di bagian atas.
2. Pilih kartu template pesan yang ingin diubah.
3. Edit teks pesan sesuai standar pelayanan kantor dan sertakan variabel dinamis yang tersedia:
   - Variabel customer_name untuk nama pelanggan.
   - Variabel bike_model untuk nama motor yang disewa.
   - Variabel start_date dan end_date untuk rentang tanggal sewa.
   - Variabel total_price untuk total tagihan sewa.
4. Klik tombol Simpan Template untuk mengaktifkan format pesan baru.

---

### 4.3 Mengatur Alur Kerja Otomatisasi WhatsApp (Workflows)

Gambar 4.3: Pengaturan Alur Kerja Pesan Otomatis (Workflows)

Pada Gambar 4.3, kita dapat mengatur pemicu (trigger) pengiriman pesan otomatis seperti pesan sambutan pelanggan baru dan pengingat jatuh tempo sewa.

Untuk mengelola workflow pesan otomatis, ikuti langkah-langkah berikut:

1. Klik menu WhatsApp, lalu pilih tab Workflows.
2. Aktifkan atau nonaktifkan sakelar pada jenis pesan otomatis yang diinginkan.
3. Tentukan waktu jeda pengiriman pengingat (misalnya kirim pengingat 2 jam sebelum waktu sewa berakhir).
4. Klik tombol Simpan Pengaturan Workflow.

---

### 4.4 Menguji Respon Asisten Cerdas AI (AI Playground)

Gambar 4.4: Halaman Uji Coba Respon AI Assistant (Playground)

Pada Gambar 4.4, kita dapat melakukan simulasi percakapan untuk menguji kecerdasan balasan asisten AI sebelum dilepas melayani pelanggan secara langsung.

Untuk melakukan pengujian asisten AI, ikuti langkah-langkah berikut:

1. Klik menu AI Assistant pada bilah menu di sebelah kiri.
2. Pilih tab AI Playground.
3. Ketikkan pertanyaan pelanggan pada kolom input di bagian bawah (contoh: Berapa harga sewa motor Vario per hari?).
4. Tekan tombol Kirim atau tekan Enter.
5. Amati jawaban yang diberikan oleh AI untuk memastikan jawaban akurat dan ramah.

---

### 4.5 Mengelola Knowledge Base Asisten AI (Bank Pengetahuan)

Gambar 4.5: Daftar Materi Pusat Pengetahuan AI (Knowledge Base)

Pada Gambar 4.5, kita dapat melihat daftar seluruh data informasi yang dipelajari oleh asisten AI untuk menjawab pertanyaan seputar syarat sewa, tarif, dan aturan rental.

Untuk menambah materi baru ke dalam Knowledge Base AI, ikuti langkah-langkah berikut:

1. Klik menu AI Assistant, lalu pilih tab Knowledge Base.
2. Klik tombol biru Tambah Materi di pojok kanan atas.
3. Layar pop-up formulir penambahan materi akan muncul.

---

### 4.6 Menambahkan Topik Pengetahuan Baru ke AI

Gambar 4.6: Formulir Penambahan Materi Baru Knowledge Base AI

Pada Gambar 4.6, kita dapat mengisi judul topik, kategori, dan jawaban detail yang wajib diingat oleh asisten AI.

Untuk mengisi dan menyimpan materi AI, ikuti langkah-langkah berikut:

1. Masukkan Judul Materi pada kolom input atas (contoh: Syarat Sewa Turis Mancanegara / WNA).
2. Pilih Kategori yang relevan dari menu dropdown (Syarat Sewa, Fasilitas, atau Tarif Luar Kota).
3. Tuliskan penjelasan jawaban secara lengkap dan jelas pada kotak Teks Materi.
4. Klik tombol Simpan & Latih AI. Sistem akan langsung memperbarui otak asisten AI secara otomatis.

---

### 4.7 Memantau Antrean Tugas Latar Belakang (Queue Monitor)

Gambar 4.7: Dasbor Pemantauan Antrean Tugas Server (Queue Worker)

Pada Gambar 4.7, kita dapat melihat status pengiriman pesan WhatsApp massal dan antrean tugas server latar belakang agar tidak ada pesan pelanggan yang terlewat.

Untuk memantau dan mengelola antrean pesan, ikuti langkah-langkah berikut:

1. Klik menu Monitor Antrian pada bilah menu kiri.
2. Periksa status ringkasan:
   - Pending: Pesan yang sedang menunggu giliran kirim.
   - Processed: Pesan yang sudah sukses terkirim ke WhatsApp pelanggan.
   - Failed: Pesan yang gagal terkirim karena nomor tidak aktif atau koneksi terputus.
3. Jika ada pesan yang gagal, klik tombol Retry Failed untuk mencoba mengirim ulang secara otomatis.
4. Klik tombol Clear Log untuk membersihkan riwayat pengiriman lama.

---

### 4.8 Menggunakan Widget Percakapan Cepat (Chat Widget)

Gambar 4.8: Widget Percakapan Floating Cepat Staf

Pada Gambar 4.8, kita dapat menggunakan widget chat melayang di pojok kanan bawah untuk berkomunikasi langsung dengan pelanggan atau mengecek riwayat pesan WhatsApp masuk tanpa harus berpindah halaman.

Untuk menggunakan Chat Widget, ikuti langkah-langkah berikut:

1. Klik ikon gelembung pesan di pojok kanan bawah layar aplikasi.
2. Kotak percakapan interaktif akan terbuka secara melayang di atas halaman kerja Anda.
3. Pilih kontak pelanggan yang ingin dibalas pada daftar pesan.
4. Tuliskan pesan balasan dan tekan tombol Kirim.

---

## BAB 5. PANDUAN SUPER ADMIN & DATA MASTER

### 5.1 Mengelola Katalog Jenis Motor

Gambar 5.1: Katalog Jenis & Tarif Sewa Model Motor

Pada Gambar 5.1, kita dapat melihat daftar model motor rental, kapasitas mesin, kapasitas tangki, serta tarif sewa harian, mingguan, dan bulanan.

Untuk mengelola katalog tipe motor, ikuti langkah-langkah berikut:

1. Buka grup menu Motor pada bilah navigasi, lalu klik Jenis Motor.
2. Klik tombol Tambah Jenis Motor di pojok kanan atas untuk memasukkan model motor baru.
3. Masukkan nama motor, cc mesin, tipe transmisi (matic/manual), dan tarif harga sewa.
4. Unggah foto resmi motor dan klik tombol Simpan.

---

### 5.2 Mengelola Unit Fisik Armada Motor

Gambar 5.2: Manajemen Unit Fisik Kendaraan & Status Plat Nomor

Pada Gambar 5.2, kita dapat memantau seluruh armada motor fisik yang ada di garasi, mencakup plat nomor kendaraan, warna, tahun, dan kondisi kesiapan operasional.

Untuk mengelola unit motor fisik, ikuti langkah-langkah berikut:

1. Buka grup menu Motor pada bilah navigasi, lalu klik Unit Motor.
2. Untuk mendaftarkan motor baru, klik tombol Tambah Unit.
3. Pilih jenis motor yang sesuai, masukkan plat nomor kendaraan, nomor rangka, warna bodi, dan kilometer awal motor.
4. Tentukan status motor: pilih Available jika motor siap disewakan atau pilih Maintenance jika motor sedang diservis di bengkel.
5. Klik tombol Simpan Unit Motor.

---

### 5.3 Menulis & Mengelola Artikel Blog Website

Gambar 5.3: Halaman Manajemen Artikel Informasi & Blog Wisata

Pada Gambar 5.3, kita dapat membuat artikel panduan wisata, tips berkendara, atau info promo sewa motor untuk meningkatkan pengunjung website publik Rosanti Bike.

Untuk membuat artikel baru, ikuti langkah-langkah berikut:

1. Klik menu Artikel Blog pada bilah menu di sebelah kiri.
2. Klik tombol Tulis Artikel Baru di pojok kanan atas.
3. Masukkan judul artikel, unggah gambar sampul, dan tulis isi artikel pada editor teks.
4. Tentukan status artikel: pilih Publish agar langsung tampil di website atau pilih Draft untuk disimpan sementara.
5. Klik tombol Simpan Artikel.

---

### 5.4 Mengelola Akun Administrator Pengguna

Gambar 5.4: Daftar Akun Administrator & Hak Akses Pengguna

Pada Gambar 5.4, kita dapat melihat seluruh akun staf yang memiliki izin mengakses panel admin dan status keaktifan masing-masing akun.

Untuk mengelola akun admin, ikuti langkah-langkah berikut:

1. Klik menu Daftar Admin pada bilah menu di sebelah kiri.
2. Untuk menambah staf baru, klik tombol Tambah Admin di pojok kanan atas.
3. Layar pop-up formulir pendaftaran admin akan terbuka.

---

### 5.5 Menambahkan Akun Admin Baru

Gambar 5.5: Formulir Pendaftaran Akun Staf Admin Baru

Pada Gambar 5.5, kita dapat mengisi data diri staf baru serta menentukan hak akses (role) yang diberikan.

Untuk mengisi data staf baru, ikuti langkah-langkah berikut:

1. Masukkan Nama Lengkap staf pada kolom input pertama.
2. Masukkan Alamat Email aktif yang akan digunakan untuk login.
3. Masukkan Nomor WhatsApp staf yang bersangkutan.
4. Buat Kata Sandi akun minimal 8 karakter.
5. Pilih Role Pengguna dari menu pilihan: Super Admin, Admin Operasional, Kasir, atau Teknisi.
6. Klik tombol Buat Akun Admin.

---

### 5.6 Mengatur Profil Bisnis & Pengaturan Sistem

Gambar 5.6: Halaman Pengaturan Profil Usaha & Rekening Bank

Pada Gambar 5.6, kita dapat memperbarui identitas bisnis rental, nomor WhatsApp resmi kantor, alamat garasi penjemputan, serta nomor rekening tujuan pembayaran pelanggan.

Untuk memperbarui konfigurasi usaha, ikuti langkah-langkah berikut:

1. Klik menu Pengaturan pada bilah menu paling bawah di sebelah kiri.
2. Pada bagian Profil Usaha, perbarui nama rental, nomor telepon kantor, dan email resmi.
3. Pada bagian Alamat & Garasi, masukkan alamat lengkap kantor penyerahan motor.
4. Pada bagian Rekening Pembayaran, masukkan nama bank, nomor rekening, dan nama pemilik rekening yang valid.
5. Klik tombol Simpan Pengaturan di bagian bawah halaman untuk menerapkan perubahan.

---

## BAB 6. STANDAR OPERASIONAL PROSEDUR (SOP) & PENUTUP

### 6.1 Prosedur Serah Terima & Pengembalian Unit Motor

1. Pemeriksaan Identitas Asli: Petugas wajib memeriksa keaslian identitas KTP/Paspor fisik dan menahan salah satu dokumen asli sebagai jaminan sewa resmi.
2. Dokumentasi Kondisi Fisik 4 Sisi: Petugas lapangan wajib mengambil foto kondisi motor dari 4 sisi bersama penyewa sebelum kunci motor diserahkan.
3. Penyediaan Perlengkapan: Setiap sewa motor wajib dilengkapi dengan 2 helm SNI bersih dan 1 paket jas hujan.
4. Pemeriksaan Unit Kembali: Petugas memeriksa volume bahan bakar, kelengkapan helm, dan kemungkinan adanya kerusakan baru saat motor dikembalikan.

### 6.2 Lembar Pakta Integritas & Pengesahan

Dengan diterbitkannya Buku Panduan Pengguna ini, seluruh jajaran pengelola dan staf operasional Rosanti Bike Motorent menyatakan siap mematuhi dan menjalankan seluruh standar operasional di atas dengan penuh tanggung jawab, disiplin, dan berintegritas tinggi.

|                         Disusun Oleh,                         |                    Disetujui & Disahkan Oleh,                    |
| :-----------------------------------------------------------: | :--------------------------------------------------------------: |
| <br><br><br><u>Tim Pengembang Sistem</u><br>Lead IT Developer | <br><br><br><u>Direktur Operasional</u><br>Rosanti Bike Motorent |

---

SEMOGA BERMANFAAT & SUKSES SELALU  
ROSANTI BIKE MOTORENT (C) 2026
