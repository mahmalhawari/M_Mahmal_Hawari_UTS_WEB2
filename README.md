# TechStore - Online Shop Electronics

> Aplikasi E-Commerce Sederhana untuk UTS Pemrograman Web 2

![TechStore Banner](https://img.shields.io/badge/TechStore-Online%20Shop-06b6d4)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Status](https://img.shields.io/badge/Status-Selesai-brightgreen)

---

## 📋 Daftar Isi
- [Deskripsi Project](#-deskripsi-project)
- [Fitur Lengkap](#-fitur-lengkap)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Menjalankan](#-cara-menjalankan)
- [Cara Penggunaan](#-cara-penggunaan)
- [Akun Demo](#-akun-demo)
- [Pemenuhan Ketentuan UTS](#-pemenuhan-ketentuan-uts)
- [Identitas Mahasiswa](#-identitas-mahasiswa)

---

## 📝 Deskripsi Project

**TechStore** adalah aplikasi *online shop* (toko elektronik) sederhana yang dibangun sebagai pemenuhan Ujian Tengah Semester (UTS) mata kuliah **Pemrograman Web 2**. Aplikasi ini mensimulasikan sistem e-commerce lengkap dengan fitur autentikasi, manajemen produk, keranjang belanja, checkout, dan riwayat pesanan.

### 🎯 Tujuan Pembuatan
1. Menerapkan konsep **Fullstack JavaScript** (Frontend + Business Logic)
2. Mengimplementasikan **Tailwind CSS** untuk UI/UX yang modern dan responsif
3. Mensimulasikan **database** menggunakan **JSON** (dummy data) dan **LocalStorage**
4. Membangun **Single Page Application (SPA)** tanpa framework berat

---

## ✨ Fitur Lengkap

### 🔐 Authentication (Simulasi)
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Login | ✅ | Menggunakan email & password |
| Register | ✅ | Pendaftaran akun baru |
| Validasi Email Unik | ✅ | Email tidak boleh terdaftar |
| Validasi Password | ✅ | Minimal 6 karakter |
| Session Management | ✅ | Menggunakan LocalStorage |

### 📦 Product Management
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Menampilkan List Produk | ✅ | Data dari products.json |
| Detail Produk | ✅ | Modal dengan spesifikasi lengkap |
| Grid Produk Responsive | ✅ | Desktop 3-4 kolom, mobile 1 kolom |
| Rating & Review | ✅ | Bintang rating (1-5) |
| Stock Indicator | ✅ | Menampilkan sisa stok |

### 🔍 Search & Filter
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Search Berdasarkan Nama | ✅ | Real-time search |
| Filter Kategori | ✅ | Laptop, Smartphone, Audio, dll |
| Filter Harga Maksimal | ✅ | Slider harga interaktif |
| Sorting Produk | ✅ | Harga, rating, nama |
| Reset Filter | ✅ | Tombol reset semua filter |

### 🛒 Cart (Keranjang Belanja)
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Tambah ke Keranjang | ✅ | Dengan notifikasi toast |
| Hapus dari Keranjang | ✅ | Konfirmasi sebelum hapus |
| Update Jumlah Item | ✅ | Tombol + dan - |
| Total Harga Otomatis | ✅ | Update real-time |
| Badge Counter | ✅ | Menampilkan jumlah item |
| Subtotal per Item | ✅ | Tampil di cart |

### 💳 Checkout
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Form Data Pengiriman | ✅ | Nama, Alamat, No HP, Kota, Kode Pos |
| Validasi Form | ✅ | Semua field wajib diisi |
| Metode Pembayaran | ✅ | Transfer, COD, E-Wallet |
| Preview Pesanan | ✅ | Menampilkan item yang dibeli |
| Generate ID Transaksi | ✅ | Format: TS-YYYYMMDD-XXXXXX |
| Simpan ke LocalStorage | ✅ | Data transaksi tersimpan |

### 📜 Order History
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Menampilkan Riwayat | ✅ | Berdasarkan user yang login |
| Detail Transaksi | ✅ | Item, total, status, alamat |
| Status Pesanan | ✅ | Diproses, Dikirim, Selesai |
| Format Tanggal | ✅ | Indonesia format (DD MMMM YYYY) |

### 🎨 UI/UX (Tailwind CSS)
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| Responsive Mobile | ✅ | Breakpoint sm, md, lg, xl |
| Responsive Desktop | ✅ | Grid layout yang rapi |
| Navbar Modern | ✅ | Glassmorphism effect |
| Animasi Halus | ✅ | Hover, transition, AOS |
| Notifikasi Toast | ✅ | Custom alert notification |
| Custom Scrollbar | ✅ | Gradient themed |

### 💾 State Management
| Fitur | Status | Keterangan |
|-------|--------|-------------|
| LocalStorage Users | ✅ | `ts_users` - Data user terdaftar |
| LocalStorage Session | ✅ | `ts_session` - User sedang login |
| LocalStorage Cart | ✅ | `ts_cart` - Keranjang per user |
| LocalStorage Orders | ✅ | `ts_orders` - Riwayat per user |

---

## 🛠️ Teknologi yang Digunakan

### Core Technologies
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| HTML5 | - | Struktur halaman |
| JavaScript | ES6+ | Logic & interaktivitas |
| Tailwind CSS | 3.x | Styling & responsive |

### Libraries & CDN
| Library | Kegunaan |
|---------|----------|
| Font Awesome 6.5.1 | Icon library |
| Google Fonts (Syne + DM Sans) | Tipografi modern |
| AOS 2.3.1 | Scroll animation |

### Data Storage
| Metode | Data yang Disimpan |
|--------|-------------------|
| products.json | Daftar produk (dummy data) |
| LocalStorage | Users, session, cart, orders |

---

## 🚀 Cara Menjalankan

### Prasyarat
1. Web browser modern (Chrome, Firefox, Edge, Safari)
2. Koneksi internet (untuk CDN)

### Cara 1: Live Server (Rekomendasi)
1. Buka folder project di VS Code
2. Install extension Live Server (Ritwick Dey)
3. Klik kanan pada index.html → Open with Live Server
4. Aplikasi akan terbuka di http://127.0.0.1:5501

### Cara 2: Python HTTP Server
bash
cd TechStore
python -m http.server 8000
# Buka http://localhost:8000

###  Cara 3: Buka Langsung
Double klik file index.html (beberapa fitur mungkin tidak optimal)

### Cara 4: Online (GitHub Pages)
Akses: https://[username].github.io/[NamaRepo]/


### 📖 Cara Penggunaan
# 1️⃣ Registrasi Akun
1. Klik tombol "Login" di pojok kanan navbar
2. Pilih tab "Register"
3. Isi data:
   - Nama Lengkap
   - Email (contoh: email@domain.com)
   - Password (minimal 6 karakter)
   - Konfirmasi Password
4. Klik "Daftar Sekarang"
5. Registrasi berhasil → otomatis login

# 2️⃣ Login
1. Klik tombol "Login"
2. Masukkan email & password
3. Klik "Masuk"
4. Berhasil login → nama user muncul di navbar

# 3️⃣ Melihat Produk
1. Halaman Home: Menampilkan produk unggulan
2. Menu "Produk": Semua produk dengan filter
3. Klik produk → muncul modal detail
4. Di modal: lihat spesifikasi lengkap

# 4️⃣ Mencari & Filter Produk
1. Buka halaman "Produk"
2. Gunakan search bar → cari berdasarkan nama
3. Pilih kategori → filter berdasarkan jenis
4. Geser slider harga → filter harga maksimal
5. Pilih sorting → urutkan produk
6. Klik "Reset Filter" → kembali ke default

# 5️⃣ Menambah ke Keranjang
1. Di halaman Home atau Produk
2. Klik tombol "+" pada produk
3. Atau buka modal detail → klik "Tambah ke Keranjang"
4. Notifikasi muncul → "Produk ditambahkan ke keranjang"
5. Badge keranjang bertambah angkanya

# 6️⃣ Mengelola Keranjang
1. Klik icon keranjang di navbar
2. Di halaman cart:
   - Klik "+" → tambah jumlah
   - Klik "-" → kurangi jumlah
   - Klik "Hapus" → hapus item
3. Total harga otomatis berubah

# 7️⃣ Checkout
1. Di halaman cart, klik "Lanjut ke Checkout"
2. Isi data pengiriman lengkap:
   - Nama penerima
   - No HP/WA
   - Alamat lengkap
   - Kota
   - Kode Pos
3. Pilih metode pembayaran
4. Review pesanan di sebelah kanan
5. Klik "Konfirmasi Pesanan"
6. Berhasil → muncul halaman sukses dengan ID transaksi

# 8️⃣ Melihat Riwayat
1. Klik menu "Riwayat" di navbar
2. Semua transaksi ditampilkan
3. Klik salah satu transaksi → lihat detail
4. Status pesanan: Diproses, Dikirim, Selesai

# 9️⃣ Logout
1. Klik tombol "Logout" di navbar
2. Keranjang otomatis kosong
3. Kembali ke halaman home

### 🔑 Akun Demo
Jika tidak ingin registrasi, gunakan akun demo berikut:
(Role : Customer Demo)  (Email :	demo@techstore.com) (Password : demo123)
# Cara menggunakan akun demo:
1. Klik "Login"
2. Masukkan email dan password di atas
3. Klik "Masuk"
---


## ✅ Pemenuhan Ketentuan UTS

### Fitur Wajib (14/14)

| No | Fitur Wajib | Status | Keterangan / Lokasi |
|:--:|-------------|:------:|---------------------|
| 1 | Authentication (Login & Register) | ✅ | Halaman Auth |
| 2 | Validasi Email Unik | ✅ | Function `handleRegister()` |
| 3 | Password Minimal 6 Karakter | ✅ | Validasi di form register |
| 4 | Menampilkan List Produk dari JSON | ✅ | `products.json` + `renderProductsPage()` |
| 5 | Detail Produk | ✅ | Modal detail produk |
| 6 | Search Produk | ✅ | Search input real-time |
| 7 | Filter Kategori & Harga | ✅ | Sidebar filter + slider harga |
| 8 | Cart (Tambah, Hapus, Update Jumlah) | ✅ | Halaman Cart |
| 9 | Total Harga Otomatis | ✅ | Function `getCartTotal()` |
| 10 | Checkout Form (Nama, Alamat, No HP) | ✅ | Halaman Checkout |
| 11 | Generate ID Transaksi | ✅ | Function `generateTxId()` |
| 12 | Simpan Transaksi ke LocalStorage | ✅ | Function `saveOrder()` |
| 13 | Order History | ✅ | Halaman History |
| 14 | Responsive (Mobile + Desktop) | ✅ | Tailwind CSS breakpoints |
| 15 | State Management LocalStorage | ✅ | `lsGet()` / `lsSet()` |

---

### Fitur Bonus

| No | Fitur Bonus | Status | Keterangan |
|:--:|-------------|:------:|-------------|
| 1 | Rating Produk | ✅ | Bintang rating (1-5) |
| 2 | Notifikasi Toast | ✅ | Custom alert notification |
| 3 | Filter Harga Slider | ✅ | Range slider interaktif |

---

### Teknologi yang Digunakan

| No | Teknologi | Status | Keterangan |
|:--:|-----------|:------:|-------------|
| 1 | HTML5 | ✅ | Struktur halaman |
| 2 | JavaScript (ES6+) | ✅ | Logic & interaktivitas |
| 3 | Tailwind CSS | ✅ | Styling & responsive |
| 4 | LocalStorage | ✅ | Penyimpanan data |
| 5 | JSON (dummy data) | ✅ | Data produk |

---

### Deployment

| Aspek | Status | Link |
|-------|:------:|------|
| **GitHub Pages** | ✅ Aktif | [https://M.Mahmal_Hawari_UTS_Web2.github.io](https://M.Mahmal_Hawari_UTS_Web2.github.io) |
| **Repository** | ✅ Public | [https://github.com/M.Mahmal_Hawari_UTS_Web2](https://github.com/M.Mahmal_Hawari_UTS_Web2) |
| **Status** | ✅ Berhasil | Live dan dapat diakses |
### 👨‍🎓 Identitas Mahasiswa
Nama Lengkap	Mochammad Mahmal Hawari
NIM	2411070088
Kelas	IT 7 Reguler Malam
Program Studi	Informatika
Mata Kuliah	Pemrograman Web 2
Dosen Pengampu	Ibu Andita
Semester	4
Tahun Akademik	2025/2026
Informasi UTS
Tanggal Mulai	20 April 2026
Tanggal Selesai	23 April 2026
Status	Selesai


### 🎯 Penutup
Demikian dokumentasi lengkap project TechStore - Online Shop Electronics. Seluruh fitur yang diminta dalam ketentuan UTS telah diimplementasikan dengan baik. Project ini merupakan bukti kemampuan dalam membangun aplikasi web modern menggunakan HTML5, JavaScript ES6+, Tailwind CSS, LocalStorage, dan JSON.

Terima kasih telah mengunjungi repository ini! 🙌
---
