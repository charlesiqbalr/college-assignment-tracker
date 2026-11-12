# 1. Domain Model and Architecture Baseline

Date: 2026-11-12

## Status
Accepted

## Context
Aplikasi "Tracker Tugas Kuliah" dirancang sebagai aplikasi web berbasis klien untuk membantu mahasiswa melacak dan mengelola tenggat tugas kuliah. Proyek ini memerlukan fondasi arsitektur yang ringan, mudah dipelihara, dan dapat diuji secara independen tanpa ketergantungan framework berat.

## Decision
1. **Tech Stack**:
   - Web frontend menggunakan Vanilla HTML5, CSS3, dan Vanilla JavaScript (ES Modules).
   - Penyimpanan data sepenuhnya di sisi browser menggunakan `localStorage`.
   - Unit testing menggunakan Node.js built-in test runner (`node --test`).
2. **Language Convention**:
   - Struktur data, penamaan variabel, kelas, dan fungsi pada kode menggunakan Bahasa Inggris (`Assignment`, `status`, `dueDate`, `priority`).
   - Teks antarmuka pengguna (UI copy) menggunakan Bahasa Indonesia ("Tugas Kuliah", "Mata Kuliah", "Tenggat Waktu", "Selesai").
3. **Core Entity Schema (`Assignment`)**:
   - `id`: `string` (UUID v4)
   - `title`: `string` (non-empty)
   - `course`: `string` (free-text, didukung `<datalist>` di UI)
   - `dueDate`: `string` (`YYYY-MM-DDTHH:mm`)
   - `status`: `'pending'` | `'completed'`
   - `priority`: `'low'` | `'medium'` | `'high'` (default `'medium'`)
   - `notes`: `string` (optional)
   - `createdAt`: `string` (ISO 8601 UTC)
4. **Deterministic Time Functions**:
   - Semua fungsi kalkulasi status tenggat waktu harus menerima parameter referensi waktu eksplisit (`now = new Date()`) untuk menjamin kemudahan unit testing.

## Consequences
- **Positif**:
  - Nol ketergantungan external npm dependencies untuk runtime aplikasi.
  - Test runner bawaan Node.js cepat dan tanpa setup rumit.
  - Model entitas sederhana dan mudah diserialisasi ke JSON untuk `localStorage`.
- **Negatif / Batasan**:
  - Data hanya tersimpan di browser perangkat lokal pengguna (tidak ada sinkronisasi multi-device tanpa backend eksternal).
  - Skema data `localStorage` harus ditangani dengan mekanisme validasi dan deserialisasi defensif.
