# 2. Due Date Urgency Logic and Visual Indicators

Date: 2026-11-12

## Status
Accepted

## Context
Aplikasi harus dapat memberi tahu pengguna secara visual tugas mana yang membutuhkan tindakan segera (mendekati tenggat waktu) atau yang sudah terlewat (terlambat), tanpa merusak kesederhanaan model penyimpanan data lokal.

## Decision
1. **Computed State for Urgency**:
   - Status urgensi tenggat (`dueStatus`) tidak disimpan ke dalam `localStorage`, melainkan dihitung secara dinamis saat data dibaca/dirender.
   - Perhitungan dilakukan menggunakan fungsi deterministik:
     ```js
     calculateDueStatus(assignment, now = new Date())
     ```
2. **Business Rules**:
   - Jika `assignment.status === 'completed'`, maka `dueStatus` selalu bernilai `'normal'` (tanda keterlambatan atau urgensi ditiadakan).
   - Konstanta ambang batas: `DUE_SOON_THRESHOLD_MS = 24 * 60 * 60 * 1000` (24 jam dalam milidetik).
   - Jika `assignment.status === 'pending'`:
     - Jika `now.getTime() > dueDate.getTime()`, hasil: `'overdue'`.
     - Jika `0 < (dueDate.getTime() - now.getTime()) <= DUE_SOON_THRESHOLD_MS`, hasil: `'due-soon'`.
     - Selain itu, hasil: `'normal'`.
3. **Visual Indicators & Accessibility**:
   - Indikator tidak hanya mengandalkan warna, tetapi juga teks label dan ikon:
     - `overdue`: Warna aksen merah, ikon peringatan ⚠️, dan label teks "Terlambat".
     - `due-soon`: Warna aksen kuning/oranye, ikon jam pasir ⏳, dan label teks "Mendekati Tenggat".
     - `completed`: Teks tercoret (*strikethrough*), kontras redup/aksen hijau, ikon centang ✅, dan label teks "Selesai".
     - `normal`: Tampilan standar netral.

## Consequences
- **Positif**:
  - Model data tetap murni tanpa redundansi data yang mudah *out-of-sync* terhadap berjalannya waktu.
  - Sangat mudah diuji dengan unit test pada berbagai skenario boundary (pas 24 jam, lewat 1 milidetik, tepat tenggat).
  - Aksesibilitas terjamin karena pengguna buta warna tetap dapat mengenali status melalui ikon dan label teks.
- **Negatif / Batasan**:
  - UI perlu memicu re-evaluasi jika tab aplikasi dibiarkan terbuka lama melintasi ambang batas waktu (dapat diatasi dengan interval timer atau re-render pada aksi pengguna).
