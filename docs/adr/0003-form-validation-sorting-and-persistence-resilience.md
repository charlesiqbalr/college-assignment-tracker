# 3. Form Validation, Sorting Logic, and Storage Resilience

Date: 2026-11-12

## Status
Accepted

## Context
Aplikasi web murni memerlukan batasan input yang jelas, aturan pengurutan (*sorting*) yang intuitif untuk mahasiswa, serta penanganan kasus batas (*edge cases*) pada `localStorage` agar terhindar dari data korup atau kerentanan keamanan seperti XSS (Cross-Site Scripting).

## Decision
1. **Scope of CRUD Operations (MVP)**:
   - Mendukung **Create** (Tambah Tugas), **Read** (Daftar Tugas), **Toggle** (Ubah status pending $\leftrightarrow$ completed), dan **Delete** (Hapus Tugas dengan `window.confirm()`).
   - Fitur **Edit** detail tugas ditunda untuk iterasi berikutnya agar cakupan MVP tetap fokus dan minimalis.
2. **Input Validation & Sanitization**:
   - `title`: Wajib diisi, panjang 1–100 karakter setelah `.trim()`.
   - `course`: Wajib diisi, panjang 1–50 karakter setelah `.trim()`.
   - `dueDate`: Format `YYYY-MM-DDTHH:mm`. Boleh bernilai di masa lalu (`dueDate < now`); tugas akan langsung berstatus terhitung `overdue`.
   - `notes`: Opsional, maksimal 500 karakter.
   - **XSS Prevention**: Semua teks yang dirender ke DOM wajib menggunakan `element.textContent` atau teknik binding aman, bukan `innerHTML` tanpa sanitasi.
3. **Filtering & Sorting Rules**:
   - **Filtering**:
     - Status Filter: `all` (default) | `pending` | `completed`.
     - Course Filter: Berdasarkan daftar nama mata kuliah unik yang diekstrak secara dinamis dari koleksi tugas aktif.
   - **Sorting**:
     - `dueDate` (Default):
       - Kelompok `pending` selalu di atas kelompok `completed`.
       - Pada kelompok `pending`: urut `dueDate` ascending (paling mendesak di paling atas).
       - Pada kelompok `completed`: urut `dueDate` descending.
     - `priority`:
       - Kelompok `pending` di atas kelompok `completed`.
       - Urutan: `high` $\rightarrow$ `medium` $\rightarrow$ `low`.
       - Tie-breaker: `dueDate` ascending.
4. **Storage Resilience (`localStorage`)**:
   - Disimpan di bawah kunci: `college_assignment_tracker_v1`.
   - **Defensive Parsing**:
     - Seluruh pembacaan data dibungkus dalam blok `try...catch`.
     - Validasi struktur array dan field minimum (`id`, `title`, `course`, `dueDate`, `status`). Item korup/tidak valid disaring (*filtered out*).
     - Jika parsing gagal total (misal invalid JSON), aplikasi fallback ke array kosong `[]` tanpa menyebabkan crash/layar putih.

## Consequences
- **Positif**:
  - Aplikasi tahan banting terhadap manipulasi manual `localStorage` di DevTools.
  - Performa komputasi pengurutan dan pemfilteran instan di sisi klien karena dataset tugas kuliah umumnya di bawah ribuan entri.
  - XSS dicegah secara struktural sejak level desain UI.
- **Negatif / Batasan**:
  - Pengguna tidak dapat mengedit salah ketik judul atau tenggat waktu tanpa menghapus dan membuat ulang tugas pada rilis MVP.
