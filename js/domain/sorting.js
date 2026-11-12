/**
 * Modul Domain: Algoritma Pengurutan (Sorting) Tugas Kuliah
 * Modul ini murni (pure functions) tanpa dependensi DOM dan tidak memutasi array asal.
 */

import { PRIORITY_WEIGHTS } from './assignment.js';

/**
 * Mengurutkan array assignments berdasarkan opsi yang dipilih ('dueDate' atau 'priority').
 *
 * Aturan:
 * - Opsi 'dueDate' (default):
 *   - Tugas pending ditempatkan di atas tugas completed.
 *   - Tugas pending diurutkan berdasarkan dueDate terdekat (ascending).
 *   - Tugas completed diurutkan berdasarkan dueDate terbaru ke terlama (descending).
 * - Opsi 'priority':
 *   - Tugas pending ditempatkan di atas tugas completed.
 *   - Tugas pending diurutkan berdasarkan bobot prioritas (high > medium > low).
 *   - Jika prioritas sama, gunakan tie-breaker dueDate terdekat (ascending).
 *   - Tugas completed ditempatkan di bawah.
 *
 * @param {Array<Object>} assignments Daftar tugas
 * @param {'dueDate'|'priority'} [sortOption='dueDate'] Opsi pengurutan
 * @param {Date} [now=new Date()] Waktu acuan saat ini
 * @returns {Array<Object>} Array baru hasil pengurutan
 */
export function sortAssignments(assignments, sortOption = 'dueDate', now = new Date()) {
  if (!Array.isArray(assignments)) {
    return [];
  }

  const pending = [];
  const completed = [];

  for (const item of assignments) {
    if (item && item.status === 'completed') {
      completed.push(item);
    } else {
      pending.push(item);
    }
  }

  if (sortOption === 'priority') {
    pending.sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a?.priority] ?? 0;
      const weightB = PRIORITY_WEIGHTS[b?.priority] ?? 0;

      if (weightB !== weightA) {
        return weightB - weightA;
      }

      const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });

    completed.sort((a, b) => {
      const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeB - timeA;
    });
  } else {
    // Default: 'dueDate'
    pending.sort((a, b) => {
      const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });

    completed.sort((a, b) => {
      const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeB - timeA;
    });
  }

  return [...pending, ...completed];
}
