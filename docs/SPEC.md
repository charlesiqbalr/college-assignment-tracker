# Spesifikasi Teknis: Tracker Tugas Kuliah (College Assignment Tracker)

Dokumen ini merupakan spesifikasi teknis lengkap untuk aplikasi web **Tracker Tugas Kuliah** yang disusun berdasarkan kesepakatan arsitektur pada [GLOSSARY.md](file:///c:/Users/Charles%20Iqbal%20R/Documents/college-assignment-tracker/GLOSSARY.md) serta catatan keputusan arsitektur (ADR) di folder [docs/adr/](file:///c:/Users/Charles%20Iqbal%20R/Documents/college-assignment-tracker/docs/adr/).

---

## Problem Statement

Sebagai mahasiswa yang menempuh banyak mata kuliah dalam satu semester, mahasiswa kerap menghadapi kesulitan dalam mengelola dan mengingat berbagai tenggat waktu tugas akademik (*assignment deadlines*). Masalah-masalah utama yang dihadapi meliputi:
1. **Risiko Keterlambatan dan Ketiadaan Prioritas**: Tugas sering kali tercampur baur tanpa indikator visual yang jelas antara tugas yang sangat mendesak (kurang dari 24 jam), tugas yang sudah lewat tenggat (*overdue*), dan tugas yang masih berjangka waktu panjang.
2. **Ketergantungan pada Aplikasi Rumit**: Banyak alat manajemen tugas eksternal yang memerlukan registrasi akun, koneksi internet konstan, atau memiliki antarmuka yang terlalu rumit dan lambat dimuat.
3. **Data Hilang atau Rusak**: Kebutuhan akan aplikasi berbasis peramban lokal yang cepat, bebas instalasi server, namun tetap andal dalam menjaga persistensi data di perangkat tanpa risiko *crash* akibat data korup.

---

## Solution

Aplikasi web **Tracker Tugas Kuliah** menyediakan solusi pelacak tugas berbasis klien (*client-side web application*) yang ringan, responsif, dan dapat langsung dibuka di peramban tanpa dependensi framework eksternal:
1. **Pelacakan Cepat & Ringan**: Dibangun menggunakan Vanilla HTML5, CSS3, dan Vanilla JavaScript berbasis ES Modules murni, dengan persistensi lokal melalui `localStorage`.
2. **Indikator Visual Urgensi yang Dinamis & Aksesibel**: Menghitung status urgensi tenggat (`dueStatus`) secara *real-time* dengan membedakan tugas normal, mendekati tenggat (`due-soon`, $\le 24$ jam), dan terlambat (`overdue`) menggunakan kombinasi warna aksen, ikon visual (⚠️, ⏳, ✅), dan teks label yang ramah aksesibilitas.
3. **Penyaringan dan Pengurutan Cerdas**: Memungkinkan mahasiswa memfilter tugas berdasarkan status penyelesaian (`pending` atau `completed`) serta mata kuliah, sekaligus mengurutkan tugas secara otomatis berdasarkan kedekatan tenggat waktu atau prioritas kepentingan (`high` $\rightarrow$ `medium` $\rightarrow$ `low`).
4. **Pemisahan Logika Domain yang Bersih**: Arsitektur modular memisahkan logika domain murni (kalkulasi status, validasi input, algoritma sorting, dan pemfilteran) dari manipulasi DOM, sehingga seluruh aturan bisnis dapat diuji secara otomatis menggunakan *test runner* bawaan Node.js (`node --test`).

---

## User Stories

1. Sebagai mahasiswa, saya ingin mencatat tugas kuliah baru dengan mengisi judul tugas, mata kuliah, tenggat waktu, tingkat prioritas, dan catatan tambahan, sehingga seluruh detail tugas tersimpan rapi di satu tempat.
2. Sebagai mahasiswa, saya ingin mendapatkan pesan validasi yang jelas jika judul tugas atau nama mata kuliah kosong atau hanya berisi spasi, sehingga data tugas yang tersimpan selalu valid dan bermakna.
3. Sebagai mahasiswa, saya ingin panjang karakter judul dibatasi hingga 100 karakter dan catatan dibatasi hingga 500 karakter, sehingga daftar tugas tetap ringkas dan tidak membebani tampilan layar.
4. Sebagai mahasiswa, saya ingin dapat memilih nama mata kuliah dari saran tugas-tugas sebelumnya melalui fitur auto-complete/datalist, sehingga saya tidak perlu mengetik ulang nama mata kuliah yang sama berulang kali.
5. Sebagai mahasiswa, saya ingin dapat memasukkan tenggat waktu yang sudah lewat, sehingga saya tetap dapat mencatat tugas lama yang terlambat untuk kebutuhan rekam jejak akademik.
6. Sebagai mahasiswa, saya ingin melihat tanda visual yang jelas (label "Mendekati Tenggat", aksen oranye/kuning, dan ikon ⏳) pada tugas yang belum selesai jika tenggat waktunya tersisa 24 jam atau kurang, sehingga saya dapat segera memprioritaskan pengerjaannya.
7. Sebagai mahasiswa, saya ingin melihat tanda peringatan tegas (label "Terlambat", aksen merah, dan ikon ⚠️) pada tugas yang belum selesai dan telah melewati tenggat waktu, sehingga saya menyadari bahwa tugas tersebut telah terlewat.
8. Sebagai mahasiswa, saya ingin tugas yang sudah berstatus selesai tidak menampilkan label terlambat atau mendekati tenggat, sehingga perhatian saya hanya terfokus pada tugas-tugas aktif yang masih harus dikerjakan.
9. Sebagai mahasiswa, saya ingin dapat mengubah status tugas antara belum selesai (*pending*) dan selesai (*completed*) dengan mencentang kotak centang (*checkbox*), sehingga progres belajar saya tercatat seketika.
10. Sebagai mahasiswa, saya ingin tugas yang telah selesai ditandai dengan teks tercoret (*strikethrough*), kontras yang lebih redup, serta ikon centang ✅, sehingga secara visual mudah dibedakan dari tugas yang masih aktif.
11. Sebagai mahasiswa, saya ingin menghapus tugas tertentu yang salah atau tidak lagi relevan dengan tombol hapus, sehingga daftar tugas saya tetap bersih.
12. Sebagai mahasiswa, saya ingin menerima dialog konfirmasi sebelum sebuah tugas dihapus permanen, sehingga saya terhindar dari ketidaksengajaan menghapus tugas penting.
13. Sebagai mahasiswa, saya ingin dapat menyaring daftar tugas berdasarkan status (Semua, Belum Selesai, Selesai), sehingga saya dapat berfokus hanya pada tugas yang belum selesai saat jam belajar.
14. Sebagai mahasiswa, saya ingin dapat menyaring daftar tugas berdasarkan mata kuliah tertentu, sehingga saya dapat melihat beban tugas per mata kuliah secara spesifik.
15. Sebagai mahasiswa, saya ingin opsi filter mata kuliah terisi otomatis berdasarkan daftar mata kuliah unik yang ada di kumpulan tugas, sehingga saya tidak perlu mengatur daftar mata kuliah secara manual.
16. Sebagai mahasiswa, saya ingin daftar tugas secara bawaan (*default*) diurutkan berdasarkan tenggat waktu dengan aturan tugas belum selesai selalu di atas tugas selesai, dan tugas belum selesai diurutkan dari tenggat terdekat, sehingga tugas paling mendesak selalu terlihat di urutan pertama.
17. Sebagai mahasiswa, saya ingin dapat mengurutkan daftar tugas berdasarkan tingkat prioritas (Tinggi $\rightarrow$ Sedang $\rightarrow$ Rendah) dengan pemecah kesamaan (*tie-breaker*) tenggat waktu terdekat, sehingga saya dapat menangani tugas dengan bobot nilai terbesar terlebih dahulu.
18. Sebagai mahasiswa, saya ingin data tugas tetap tersimpan di peramban saat tab ditutup atau halaman dimuat ulang (*refresh*), sehingga saya tidak kehilangan data yang telah dicatat.
19. Sebagai mahasiswa, saya ingin formulir input otomatis dikosongkan dan difokuskan kembali setelah tugas berhasil ditambahkan, sehingga proses penginputan banyak tugas berturut-turut berjalan lancar dan cepat.
20. Sebagai pengguna dengan keterbatasan penglihatan atau buta warna, saya ingin status urgensi dan status penyelesaian tugas tidak hanya bergantung pada warna tetapi juga teks deskriptif dan ikon, sehingga saya dapat memahami status tugas secara mandiri.
21. Sebagai mahasiswa, saya ingin melihat pesan ramah ketika tidak ada tugas yang cocok dengan filter yang dipilih, sehingga saya mengetahui bahwa sistem berfungsi dengan baik dan daftar memang kosong.
22. Sebagai mahasiswa, saya ingin aplikasi tetap berjalan normal dan menampilkan daftar kosong jika data di penyimpanan lokal sempat rusak atau tidak valid, sehingga peramban saya tidak mengalami *white screen* atau galat tak terduga.

---

## Implementation Decisions

### 1. Struktur Folder dan Modul ES Modules

Arsitektur aplikasi menerapkan pemisahan tanggung jawab (*separation of concerns*) yang tegas antara **Logika Murni Domain/Penyimpanan** (*pure logic without DOM*) dan **Modul Antarmuka Pengguna/DOM**.

```
college-assignment-tracker/
├── index.html                   # Halaman antarmuka utama (HTML5 Semantik)
├── css/
│   └── style.css                # Desain visual, variabel tema, indikator status
├── js/
│   ├── app.js                   # Entry point aplikasi: inisialisasi state & event listeners
│   ├── ui.js                    # DOM rendering, event handler delegator, binding aman
│   ├── domain/
│   │   ├── assignment.js        # Model entitas, validasi input, kalkulasi dueStatus
│   │   ├── sorting.js           # Algoritma pengurutan (dueDate & priority)
│   │   └── filter.js            # Algoritma pemfilteran (status & course, ekstrak mata kuliah)
│   └── storage/
│       └── storage.js           # Abstraksi localStorage, deserialisasi defensif & fallback
├── test/
│   ├── domain/
│   │   ├── assignment.test.js   # Unit test entitas, validasi, dan dueStatus
│   │   ├── sorting.test.js      # Unit test logika pengurutan
│   │   └── filter.test.js       # Unit test logika pemfilteran
│   └── storage/
│       └── storage.test.js      # Unit test persistensi dan ketahanan parsing
├── docs/
│   ├── SPEC.md                  # Dokumen spesifikasi teknis (dokumen ini)
│   └── adr/                     # Catatan keputusan arsitektur (ADR-0001 s.d. ADR-0003)
├── GLOSSARY.md                  # Glosarium istilah domain resmi
└── package.json                 # Konfigurasi project & script "test": "node --test"
```

### 2. Modul Domain & Kontrak Fungsi Utama

Semua modul di dalam `js/domain/` dan `js/storage/` merupakan fungsi murni (*pure functions*) atau kelas tanpa ketergantungan pada objek global peramban seperti `window`, `document`, atau `HTMLElement`. Ketergantungan waktu disuntikkan melalui parameter eksplisit (`now`).

#### A. Modul Entitas & Validasi: `js/domain/assignment.js`
- **Konstanta**:
  - `DUE_SOON_THRESHOLD_MS = 24 * 60 * 60 * 1000` (24 jam dalam milidetik).
  - `PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 }`.
- **`validateAssignmentInput(input)`**:
  - *Parameter*: `input` (`{ title, course, dueDate, priority?, notes? }`)
  - *Perilaku*:
    - Melakukan `trim()` pada `title` dan `course`.
    - Memvalidasi `title`: wajib ada, panjang 1–100 karakter.
    - Memvalidasi `course`: wajib ada, panjang 1–50 karakter.
    - Memvalidasi `dueDate`: format ISO lokal `YYYY-MM-DDTHH:mm` valid (diperiksa dengan `!isNaN(new Date(dueDate).getTime())`).
    - Memvalidasi `priority`: jika ada, harus salah satu dari `'low'`, `'medium'`, `'high'`. Default: `'medium'`.
    - Memvalidasi `notes`: string opsional, maksimal 500 karakter. Default: `''`.
  - *Return*: `{ isValid: boolean, errors: Record<string, string>, sanitizedData: Object }`
- **`createAssignment(rawInput)`**:
  - *Parameter*: `rawInput` (`Object`)
  - *Perilaku*: Memvalidasi input melalui `validateAssignmentInput`. Jika tidak valid, melempar `ValidationError`. Jika valid, membuat objek entitas lengkap dengan `id` (menggunakan `crypto.randomUUID()` atau utilitas UUID unik) dan `createdAt: new Date().toISOString()`.
  - *Return*: Objek `Assignment`:
    ```ts
    {
      id: string,
      title: string,
      course: string,
      dueDate: string,         // Format YYYY-MM-DDTHH:mm
      status: 'pending',       // Default pada pembuatan baru
      priority: 'low' | 'medium' | 'high',
      notes: string,
      createdAt: string        // ISO 8601 UTC
    }
    ```
- **`calculateDueStatus(assignment, now = new Date())`**:
  - *Parameter*: `assignment` (`Assignment`), `now` (`Date`, default: `new Date()`)
  - *Perilaku*:
    - Jika `assignment.status === 'completed'` $\rightarrow$ return `'normal'`.
    - Buat objek `dueTime = new Date(assignment.dueDate).getTime()`.
    - Buat objek `currentTime = now.getTime()`.
    - Jika `currentTime > dueTime` $\rightarrow$ return `'overdue'`.
    - Jika `0 < (dueTime - currentTime) <= DUE_SOON_THRESHOLD_MS` $\rightarrow$ return `'due-soon'`.
    - Selain kondisi di atas $\rightarrow$ return `'normal'`.
  - *Return*: `'normal' | 'due-soon' | 'overdue'`

#### B. Modul Pengurutan: `js/domain/sorting.js`
- **`sortAssignments(assignments, sortOption = 'dueDate', now = new Date())`**:
  - *Parameter*: `assignments` (`Array<Assignment>`), `sortOption` (`'dueDate' | 'priority'`), `now` (`Date`)
  - *Perilaku*:
    - Mengembalikan *array* baru tanpa mengubah (*mutate*) *array* asal.
    - Kelompok tugas berstatus `pending` selalu ditempatkan sebelum kelompok `completed`.
    - Jika `sortOption === 'dueDate'`:
      - Pada kelompok `pending`: urutkan berdasarkan `new Date(a.dueDate) - new Date(b.dueDate)` secara ascending (tenggat terdekat di atas).
      - Pada kelompok `completed`: urutkan berdasarkan `new Date(b.dueDate) - new Date(a.dueDate)` secara descending.
    - Jika `sortOption === 'priority'`:
      - Pada kelompok `pending`: urutkan berdasarkan bobot prioritas (`high` > `medium` > `low`). Jika prioritas sama, gunakan *tie-breaker* `dueDate` ascending.
      - Pada kelompok `completed`: ditempatkan di bawah kelompok `pending`.
  - *Return*: `Array<Assignment>`

#### C. Modul Penyaringan: `js/domain/filter.js`
- **`filterAssignments(assignments, filters)`**:
  - *Parameter*: `assignments` (`Array<Assignment>`), `filters` (`{ status?: 'all'|'pending'|'completed', course?: string }`)
  - *Perilaku*:
    - Jika `filters.status && filters.status !== 'all'`: hanya sertakan tugas dengan `assignment.status === filters.status`.
    - Jika `filters.course && filters.course !== 'all'`: hanya sertakan tugas dengan `assignment.course.toLowerCase() === filters.course.toLowerCase()`.
  - *Return*: `Array<Assignment>`
- **`extractUniqueCourses(assignments)`**:
  - *Parameter*: `assignments` (`Array<Assignment>`)
  - *Perilaku*: Mengambil seluruh nama mata kuliah unik yang sudah di-`trim()`, diurutkan secara alfabetis.
  - *Return*: `Array<string>`

#### D. Modul Persistensi Penyimpanan: `js/storage/storage.js`
- **Konstanta**: `STORAGE_KEY = 'college_assignment_tracker_v1'`.
- **`loadAssignments(storageBackend = window.localStorage)`**:
  - *Perilaku*:
    - Membaca item dari `storageBackend.getItem(STORAGE_KEY)` di dalam blok `try...catch`.
    - Jika bernilai `null` atau kosong, mengembalikan array kosong `[]`.
    - Melakukan `JSON.parse()`. Jika hasil bukan array, mengembalikan `[]`.
    - Melakukan verifikasi defensif terhadap setiap elemen: memastikan elemen berupa objek dengan field wajib `id` (string), `title` (string), `course` (string), `dueDate` (string), dan `status` (`'pending'` atau `'completed'`). Item korup dibuang (*filtered out*).
    - Jika parsing melempar exception (misal: JSON rusak), menangkap galat, mencatat log peringatan, dan mengembalikan `[]` secara aman tanpa melempar error fatal.
  - *Return*: `Array<Assignment>`
- **`saveAssignments(assignments, storageBackend = window.localStorage)`**:
  - *Perilaku*:
    - Melakukan serialisasi `JSON.stringify(assignments)`.
    - Memanggil `storageBackend.setItem(STORAGE_KEY, jsonString)` di dalam blok `try...catch` (mengantisipasi `QuotaExceededError`).
  - *Return*: `boolean` (status keberhasilan simpan)

### 3. Struktur HTML Semantik & Aksesibilitas

Dokumen `index.html` dibangun menggunakan elemen HTML5 semantik murni untuk memastikan struktur ramah *screen reader* dan navigasi keyboard:
- `<header>`: Judul utama aplikasi (`<h1>Tracker Tugas Kuliah</h1>`) dan deskripsi singkat.
- `<main>`:
  - `<section aria-labelledby="form-heading">`:
    - Memuat `<h2 id="form-heading">Tambah Tugas Baru</h2>`.
    - `<form id="assignment-form" novalidate>`:
      - Grup input Judul: `<label for="assignment-title">Judul Tugas</label>`, `<input type="text" id="assignment-title" name="title" maxlength="100" required aria-describedby="title-error">`, `<span id="title-error" class="error-text" aria-live="polite"></span>`.
      - Grup input Mata Kuliah: `<label for="assignment-course">Mata Kuliah</label>`, `<input type="text" id="assignment-course" name="course" maxlength="50" list="course-suggestions" required aria-describedby="course-error">`, `<datalist id="course-suggestions"></datalist>`, `<span id="course-error" class="error-text" aria-live="polite"></span>`.
      - Grup input Tenggat Waktu: `<label for="assignment-due-date">Tenggat Waktu</label>`, `<input type="datetime-local" id="assignment-due-date" name="dueDate" required aria-describedby="due-date-error">`, `<span id="due-date-error" class="error-text" aria-live="polite"></span>`.
      - Grup input Prioritas: `<label for="assignment-priority">Prioritas</label>`, `<select id="assignment-priority" name="priority"><option value="low">Rendah</option><option value="medium" selected>Sedang</option><option value="high">Tinggi</option></select>`.
      - Grup input Catatan: `<label for="assignment-notes">Catatan Tambahan (Opsional)</label>`, `<textarea id="assignment-notes" name="notes" maxlength="500"></textarea>`.
      - Tombol Aksi: `<button type="submit" id="submit-button">Simpan Tugas</button>`.
  - `<section aria-labelledby="list-heading">`:
    - Memuat `<h2 id="list-heading">Daftar Tugas</h2>`.
    - Kontrol Filter & Urutan (Toolbar / Bar Kontrol):
      - Filter Status: `<label for="filter-status">Filter Status:</label>`, `<select id="filter-status"><option value="all">Semua</option><option value="pending">Belum Selesai</option><option value="completed">Selesai</option></select>`.
      - Filter Mata Kuliah: `<label for="filter-course">Filter Mata Kuliah:</label>`, `<select id="filter-course"><option value="all">Semua Mata Kuliah</option></select>`.
      - Urutan (*Sort*): `<label for="sort-by">Urutkan Berdasarkan:</label>`, `<select id="sort-by"><option value="dueDate">Tenggat Waktu</option><option value="priority">Tingkat Prioritas</option></select>`.
    - Wadah Daftar Tugas:
      - `<ul id="assignment-list" class="assignment-list" aria-live="polite"></ul>`.
      - Indikator Daftar Kosong: `<p id="empty-state" class="empty-state" hidden>Tidak ada tugas yang ditemukan.</p>`.

### 4. Perilaku Antarmuka Pengguna (UI Behavior)

#### A. Penanganan Form & Validasi Interaktif
- Saat formulir dikirim (*submit*):
  - Sistem mengintersepsi event submit dengan `event.preventDefault()`.
  - Input diambil dan divalidasi melalui fungsi domain `validateAssignmentInput`.
  - Jika ada kesalahan validasi: kelas CSS error ditambahkan ke input yang bermasalah, pesan teks kesalahan ditampilkan di elemen `<span aria-live="polite">`, dan fokus dialihkan ke input pertama yang tidak valid.
  - Jika valid: entitas dibuat via `createAssignment`, ditambahkan ke state array tugas, disimpan ke `localStorage`, dan seluruh form di-reset dengan memfokuskan kembali input judul tugas.

#### B. Rendering Item Tugas & Penanda Visual `dueStatus`
- Setiap tugas dirender sebagai elemen `<li>` di dalam `#assignment-list`.
- **Pencegahan XSS**: Seluruh nilai teks (`title`, `course`, `notes`) diinjeksikan secara aman menggunakan properti `element.textContent` atau pembuatan simpul teks (`document.createTextNode()`), dilarang menggunakan `innerHTML` langsung dengan data mentah pengguna.
- **Indikator Visual Berdasarkan `dueStatus` dan `status`**:
  - Jika `status === 'completed'`:
    - Elemen `<li>` memiliki atribut/kelas `data-status="completed"`.
    - Judul tugas memiliki garis coret (*strikethrough*).
    - Menampilkan lencana (*badge*) status: `<span class="badge badge-completed">✅ Selesai</span>`.
  - Jika `status === 'pending'`:
    - Dihitung nilai `dueStatus = calculateDueStatus(assignment, new Date())`.
    - Jika `dueStatus === 'overdue'`:
      - Elemen `<li>` memiliki kelas border/aksen merah `due-status-overdue`.
      - Lencana status: `<span class="badge badge-overdue">⚠️ Terlambat</span>`.
    - Jika `dueStatus === 'due-soon'`:
      - Elemen `<li>` memiliki kelas border/aksen oranye `due-status-due-soon`.
      - Lencana status: `<span class="badge badge-due-soon">⏳ Mendekati Tenggat</span>`.
    - Jika `dueStatus === 'normal'`:
      - Tampilan standar tanpa warna peringatan khusus.
- **Badge Prioritas**:
  - `high`: `<span class="badge-priority priority-high">Prioritas: Tinggi</span>`.
  - `medium`: `<span class="badge-priority priority-medium">Prioritas: Sedang</span>`.
  - `low`: `<span class="badge-priority priority-low">Prioritas: Rendah</span>`.

#### C. Interaksi Pengguna (Toggle Status & Delete)
- **Toggle Status**:
  - Setiap kartu tugas memiliki elemen checkbox status (`<input type="checkbox" ...>`).
  - Ketika checkbox diklik, status tugas berpindah secara langsung antara `pending` $\leftrightarrow$ `completed`.
  - State lokal dan `localStorage` diperbarui, kemudian daftar di-render ulang.
- **Hapus Tugas**:
  - Setiap kartu tugas memiliki tombol hapus (`<button class="delete-btn" aria-label="Hapus tugas [Judul]">Hapus</button>`).
  - Ketika tombol hapus diklik, aplikasi memunculkan dialog konfirmasi bawaan peramban:
    `window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')`.
  - Jika pengguna mengonfirmasi (OK), tugas dihapus dari koleksi state, disimpan ke `localStorage`, dan daftar dirender ulang. Jika dibatalkan, tidak ada perubahan yang terjadi.

#### D. Pembaruan Waktu Nyata (*Real-time Recalculation*)
- Karena `dueStatus` bergantung pada waktu berjalan (`now`), aplikasi menetapkan interval waktu (misal: setiap 60 detik) untuk memicu pembaruan ulang rendering status urgensi pada tugas-tugas yang sedang ditampilkan, sehingga status otomatis berubah dari normal menjadi `due-soon` atau `overdue` tanpa perlu *reload* halaman manual.

---

## Testing Decisions

### 1. Prinsip & Kriteria Pengujian Berkualitas
- **Pengujian Perilaku Eksternal (*External Behavior*)**: Pengujian hanya memeriksa input dan output dari kontrak publik modul, bukan detail implementasi internal atau variabel privat.
- **Kemandirian Lingkungan (*Decoupled from DOM*)**: Seluruh unit test domain dan storage berjalan di lingkungan Node.js murni tanpa memerlukan DOM simulasi berat (seperti JSDOM) untuk aturan bisnis dasar.
- **Waktu Deterministik (*Deterministic Time*)**: Setiap pengujian yang berhubungan dengan perhitungan tenggat waktu wajib menyuntikkan objek `now` secara eksplisit guna menghindari *flaky tests* akibat selisih milidetik waktu eksekusi.

### 2. Modul yang Diuji & Seam Arsitektur
- **Seam Arsitektur Tertinggi**:
  - Antarmuka modul domain (`assignment.js`, `sorting.js`, `filter.js`) dan modul penyimpanan (`storage.js`) menjadi batas isolasi (*testing seam*).
  - Pada pengujian `storage.js`, objek penyimpanan disuntikkan menggunakan *in-memory mock storage* sederhana yang mengimplementasikan antarmuka `getItem`, `setItem`, dan `removeItem`.
- **Modul yang Dicakup**:
  1. `test/domain/assignment.test.js`: Validasi input data, pembuatan entitas `Assignment`, dan fungsi penentu `calculateDueStatus`.
  2. `test/domain/sorting.test.js`: Logika pengurutan berdasarkan tenggat waktu (`dueDate`) dan tingkat prioritas (`priority`) termasuk aturan kombinasi status pending/completed.
  3. `test/domain/filter.test.js`: Logika penyaringan berdasarkan status dan mata kuliah, serta fungsi ekstraksi daftar mata kuliah unik.
  4. `test/storage/storage.test.js`: Serialisasi data, deserialisasi defensif terhadap JSON tidak valid, dan pembersihan item korup.

### 3. Tooling & Prior Art
- Menggunakan test runner bawaan Node.js: `node --test`.
- Modul asersi: `node:assert/strict`.
- Eksekusi pengujian dilakukan melalui perintah: `npm test` atau `node --test test/**/*.test.js`.

### 4. Rencana Pengujian Komprehensif (Test Cases)

#### A. Pengujian `assignment.js`
- **Skenario Normal**:
  1. `validateAssignmentInput`: Menerima input valid lengkap dan mengembalikan data yang sudah di-`trim` dengan `isValid: true`.
  2. `validateAssignmentInput`: Menetapkan default `priority: 'medium'` dan `notes: ''` bila tidak diberikan.
  3. `createAssignment`: Menghasilkan entitas `Assignment` dengan properti `id` unik, status `'pending'`, dan `createdAt` berformat ISO 8601 UTC.
  4. `calculateDueStatus`: Mengembalikan `'normal'` bila tugas memiliki sisa waktu lebih dari 24 jam.
  5. `calculateDueStatus`: Mengembalikan `'due-soon'` bila tugas memiliki sisa waktu kurang dari atau tepat 24 jam sebelum tenggat.
  6. `calculateDueStatus`: Mengembalikan `'overdue'` bila waktu `now` telah melewati `dueDate`.
  7. `calculateDueStatus`: Mengembalikan `'normal'` bila tugas berstatus `'completed'` meskipun waktu `dueDate` telah lewat.
- **Skenario Kasus Batas (Edge Cases)**:
  8. Validasi gagal jika `title` hanya berisi spasi kosong (`'   '`).
  9. Validasi gagal jika `title` melebihi 100 karakter.
  10. Validasi batas sukses jika `title` tepat 100 karakter.
  11. Validasi gagal jika `course` hanya berisi spasi kosong.
  12. Validasi gagal jika `course` melebihi 50 karakter.
  13. Validasi gagal jika format `dueDate` tidak valid (bukan representasi tanggal valid).
  14. Validasi sukses jika `dueDate` berada di masa lalu (tetap diperbolehkan sesuai ADR-0003).
  15. Validasi gagal jika `notes` melebihi 500 karakter.
  16. `calculateDueStatus`: Tepat pada batas ambang 24 jam (selisih pas $24 \times 3600 \times 1000\text{ ms}$) mengembalikan `'due-soon'`.
  17. `calculateDueStatus`: Selisih 24 jam ditambah 1 milidetik mengembalikan `'normal'`.
  18. `calculateDueStatus`: Selisih 0 milidetik (tepat pada tenggat waktu) atau lewat 1 milidetik mengembalikan `'overdue'`.

#### B. Pengujian `sorting.js`
- **Skenario Normal**:
  1. `sortAssignments (dueDate)`: Mengurutkan tugas `pending` dari yang tenggat waktunya paling dekat ke yang paling lama.
  2. `sortAssignments (dueDate)`: Menempatkan seluruh tugas `pending` di atas seluruh tugas `completed`.
  3. `sortAssignments (dueDate)`: Mengurutkan sesama tugas `completed` dari tenggat waktu terbaru ke terlama (*descending*).
  4. `sortAssignments (priority)`: Mengurutkan tugas `pending` berdasarkan prioritas `high` $\rightarrow$ `medium` $\rightarrow$ `low`.
  5. `sortAssignments (priority)`: Menerapkan *tie-breaker* `dueDate` terdekat jika terdapat beberapa tugas `pending` dengan prioritas yang sama.
- **Skenario Kasus Batas (Edge Cases)**:
  6. Pengurutan pada array kosong `[]` mengembalikan array kosong baru tanpa galat.
  7. Pengurutan pada array dengan satu elemen mengembalikan array baru dengan elemen yang sama.
  8. Fungsi tidak mengubah urutan mutasi pada array asal (*immutability check*).
  9. Seluruh tugas berstatus `completed` tetap terurut dengan benar tanpa tugas `pending`.

#### C. Pengujian `filter.js`
- **Skenario Normal**:
  1. `filterAssignments`: Mengembalikan seluruh tugas saat filter status bernilai `'all'` dan course bernilai `'all'`.
  2. `filterAssignments`: Menyaring hanya tugas berstatus `'pending'` saat filter status adalah `'pending'`.
  3. `filterAssignments`: Menyaring hanya tugas berstatus `'completed'` saat filter status adalah `'completed'`.
  4. `filterAssignments`: Menyaring tugas berdasarkan mata kuliah tertentu.
  5. `filterAssignments`: Mengombinasikan filter status `'pending'` dan filter mata kuliah tertentu secara bersamaan.
  6. `extractUniqueCourses`: Mengembalikan daftar nama mata kuliah unik tanpa duplikasi dalam urutan alfabetis.
- **Skenario Kasus Batas (Edge Cases)**:
  7. Menyaring daftar yang tidak memiliki kecocokan menghasilkan array kosong `[]`.
  8. Pencocokan nama mata kuliah bersifat *case-insensitive* (misal: `"Alpro"` cocok dengan `"alpro"`).
  9. `extractUniqueCourses` pada array kosong menghasilkan `[]`.

#### D. Pengujian `storage.js`
- **Skenario Normal**:
  1. `saveAssignments`: Menyimpan array tugas ke penyimpanan dengan format JSON yang benar di bawah kunci `college_assignment_tracker_v1`.
  2. `loadAssignments`: Berhasil memuat dan mem-parsing data tugas yang valid dari penyimpanan.
- **Skenario Kasus Batas (Edge Cases & Defensive)**:
  3. `loadAssignments` mengembalikan `[]` jika item di `localStorage` bernilai `null` (belum pernah ada data).
  4. `loadAssignments` mengembalikan `[]` jika isi penyimpanan bukan JSON valid (misal string korup `"{invalid-json"`).
  5. `loadAssignments` mengembalikan `[]` jika data JSON bukan bertipe array (misal objek tunggal `{}` atau integer).
  6. `loadAssignments` menyaring dan membuang elemen array yang tidak memiliki properti esensial (`id`, `title`, `course`, `dueDate`, atau `status`).
  7. `saveAssignments` menangani pengecualian *storage quota exceeded* secara anggun (*graceful failure*) dan mengembalikan `false` tanpa menghentikan aplikasi.

---

## Out of Scope

Fitur-fitur berikut secara eksplisit berada di luar cakupan rilis MVP saat ini:
1. **Fitur Edit Tugas**: Pengeditan kembali detail tugas (judul, tenggat, dll.) setelah dibuat tidak disertakan pada tahap ini demi menjaga kesederhanaan alur kerja MVP (sesuai ADR-0003). Pengguna dapat menghapus dan membuat ulang tugas jika terjadi kesalahan input.
2. **Sinkronisasi Multi-Perangkat atau Backend Database**: Data hanya disimpan di `localStorage` peramban lokal perangkat pengguna. Tidak ada sinkronisasi server/cloud, database eksternal, atau autentikasi akun (sesuai ADR-0001).
3. **Notifikasi Sistem Operasi / Push Notification**: Aplikasi tidak menggunakan Web Push Notifications atau background workers yang berjalan saat tab tertutup.
4. **Integrasi Kalender Eksternal**: Fitur ekspor/impor ke Google Calendar, Apple Calendar, atau format file `.ics` berada di luar cakupan.
5. **Sub-tugas / Checklist Tambahan**: Pemecahan tugas ke dalam subtugas bertingkat (*nested subtasks*) tidak didukung pada versi ini.

---

## Further Notes

1. **Konvensi Bahasa & Penamaan**:
   - Seluruh identifier kode (nama variabel, fungsi, properti objek, kelas CSS, atribut data) ditulis dalam **Bahasa Inggris** (contoh: `assignment`, `dueDate`, `dueStatus`, `priority`).
   - Seluruh teks yang tampil pada antarmuka pengguna (UI copy, teks label, tombol, pesan konfirmasi, lencana status) ditulis dalam **Bahasa Indonesia** (contoh: "Tugas Kuliah", "Tenggat Waktu", "Belum Selesai", "Terlambat").
2. **Keamanan & Standar DOM**:
   - Selalu gunakan `textContent` untuk merender data string yang berasal dari input pengguna guna mencegah potensi kerentanan injeksi skrip lintas situs (*Cross-Site Scripting / XSS*).
3. **Kompatibilitas Peramban**:
   - Membutuhkan peramban modern yang mendukung ECMAScript Modules (`<script type="module">`), API `crypto.randomUUID()`, dan CSS Grid/Flexbox modern.
