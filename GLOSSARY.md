# Domain Glossary

Ubiquitous language for the **Tracker Tugas Kuliah** (College Assignment Tracker) project.
Code identifiers and data models MUST use English domain terms; UI copy MUST use Indonesian terms.

---

## Terms & Entities

### `Assignment`
* **UI Label**: Tugas Kuliah / Tugas
* **Definition**: Entitas utama yang merepresentasikan suatu tugas akademik yang diberikan oleh dosen pada mata kuliah tertentu dengan tenggat waktu penyelesaian.
* **Avoid Synonyms**: *Task*, *Todo*, *Pekerjaan Rumah*, *PR* (gunakan selalu `Assignment` di kode dan `Tugas` di UI).
* **Fields**:
  * `id` (`string`): Pengenal unik tugas (UUID v4 atau string timestamp unik).
  * `title` (`string`): Judul atau deskripsi singkat tugas (wajib diisi, 1–100 karakter setelah di-`trim()`).
  * `course` (`string`): Nama mata kuliah pengampu tugas (wajib diisi, 1–50 karakter setelah di-`trim()`, free-text).
  * `dueDate` (`string`): Waktu tenggat pengumpulan tugas dalam format ISO string lokal `YYYY-MM-DDTHH:mm`. Boleh bernilai di masa lalu (otomatis dianggap `overdue`).
  * `status` (`AssignmentStatus`): Status penyelesaian tugas (`pending` | `completed`).
  * `priority` (`PriorityLevel`): Tingkat urgensi atau prioritas tugas (`low` | `medium` | `high`, default: `medium`).
  * `notes` (`string`): Catatan atau instruksi tambahan mengenai tugas (opsional, maksimal 500 karakter, default: string kosong).
  * `createdAt` (`string`): Timestamp waktu pembuatan entitas dalam format ISO 8601 UTC string.

---

### `AssignmentStatus`
* **UI Label**: Status Tugas
* **Definition**: Keadaan siklus hidup penyelesaian tugas yang disimpan secara persisten.
* **Values**:
  * `pending` (UI: "Belum Selesai"): Tugas masih aktif dan belum diselesaikan oleh mahasiswa.
  * `completed` (UI: "Selesai"): Tugas telah selesai dikerjakan.
* **Avoid Synonyms**: *done*, *undone*, *active*, *finished*, *in-progress*.

---

### `DueStatus` (Computed State)
* **UI Label**: Status Urgensi Tenggat
* **Definition**: Status dinamis (tidak disimpan di database/localStorage) yang dihitung dari relasi antara `dueDate`, `status`, dan waktu acuan `now`.
* **Values**:
  * `normal` (UI: "Normal" / Netral): Tugas masih memiliki waktu lebih dari 24 jam sebelum tenggat, ATAU tugas sudah berstatus `completed`.
  * `due-soon` (UI: "Mendekati Tenggat"): Tugas berstatus `pending` dan $0 < (\text{dueDate} - \text{now}) \le 24\text{ jam}$.
  * `overdue` (UI: "Terlambat"): Tugas berstatus `pending` dan $\text{now} > \text{dueDate}$.
* **Avoid Synonyms**: *deadline-state*, *urgency-status*, *late-status*.

---

### `PriorityLevel`
* **UI Label**: Prioritas
* **Definition**: Skala kepentingan atau urgensi tugas.
* **Values**:
  * `low` (UI: "Rendah"): Beban atau urgensi ringan.
  * `medium` (UI: "Sedang"): Tingkat urgensi standar (default).
  * `high` (UI: "Tinggi"): Tugas krusial atau bobot nilai besar.
* **Avoid Synonyms**: *urgency*, *importance*, *criticality*.

---

### `Course`
* **UI Label**: Mata Kuliah
* **Definition**: Nama mata kuliah yang diasosiasikan dengan tugas. Disimpan sebagai free-text pada setiap `Assignment`.
* **Avoid Synonyms**: *Subject*, *Class*, *Pelajaran*.

---

### `FilterStatus`
* **UI Label**: Filter Status
* **Definition**: Kriteria penyaringan daftar tugas berdasarkan status penyelesaian.
* **Values**:
  * `all` (UI: "Semua"): Menampilkan seluruh tugas tanpa memfilter status.
  * `pending` (UI: "Belum Selesai"): Hanya menampilkan tugas berstatus `pending`.
  * `completed` (UI: "Selesai"): Hanya menampilkan tugas berstatus `completed`.

---

### `SortOption`
* **UI Label**: Urutan / Urutkan Berdasarkan
* **Definition**: Kriteria pengurutan daftar tugas yang ditampilkan di UI.
* **Values**:
  * `dueDate` (UI: "Tenggat Waktu" / Default):
    1. Tugas `pending` berada di atas tugas `completed`.
    2. Sesama tugas `pending` diurutkan berdasarkan `dueDate` terdekat terlebih dahulu (ascending).
    3. Tugas `completed` berada di bawah dan diurutkan berdasarkan `dueDate` terbaru ke terlama (descending).
  * `priority` (UI: "Tingkat Prioritas"):
    1. Tugas `pending` berada di atas tugas `completed`.
    2. Sesama tugas `pending` diurutkan berdasarkan prioritas tertinggi (`high` $\rightarrow$ `medium` $\rightarrow$ `low`), dengan tie-breaker `dueDate` terdekat.
    3. Tugas `completed` berada di bawah.
