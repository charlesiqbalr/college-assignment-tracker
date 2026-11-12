/**
 * Modul Persistensi Penyimpanan Lokal (LocalStorage)
 *
 * Mengelola penyimpanan dan pembacaan koleksi tugas dengan penanganan
 * defensif terhadap data korup dan penanganan galat anggun (graceful fallback).
 */

export const STORAGE_KEY = 'college_assignment_tracker_v1';

/**
 * Mendapatkan backend penyimpanan bawaan (window.localStorage jika tersedia).
 * @returns {Storage | null}
 */
function getDefaultStorageBackend() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Memvalidasi apakah sebuah entitas tugas memiliki properti esensial yang valid.
 * @param {unknown} item
 * @returns {boolean}
 */
function isValidAssignmentItem(item) {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return false;
  }

  const { id, title, course, dueDate, status } = item;

  const hasValidId = typeof id === 'string' && id.trim().length > 0;
  const hasValidTitle = typeof title === 'string' && title.trim().length > 0;
  const hasValidCourse = typeof course === 'string' && course.trim().length > 0;
  const hasValidDueDate = typeof dueDate === 'string' && dueDate.trim().length > 0;
  const hasValidStatus = status === 'pending' || status === 'completed';

  return hasValidId && hasValidTitle && hasValidCourse && hasValidDueDate && hasValidStatus;
}

/**
 * Menyimpan array tugas ke penyimpanan lokal dalam format JSON.
 * Menangani QuotaExceededError dan galat penyimpanan lainnya secara aman.
 *
 * @param {Array<Object>} assignments - Daftar tugas yang akan disimpan
 * @param {Storage} [storageBackend=getDefaultStorageBackend()] - Objek backend penyimpanan
 * @returns {boolean} true jika berhasil disimpan, false jika terjadi kegagalan
 */
export function saveAssignments(assignments, storageBackend = getDefaultStorageBackend()) {
  if (!storageBackend || typeof storageBackend.setItem !== 'function') {
    return false;
  }

  try {
    const jsonString = JSON.stringify(assignments);
    storageBackend.setItem(STORAGE_KEY, jsonString);
    return true;
  } catch (error) {
    console.warn('Gagal menyimpan tugas ke penyimpanan lokal:', error);
    return false;
  }
}

/**
 * Memuat dan mendeserialisasi daftar tugas dari penyimpanan lokal.
 * Menerapkan parsing defensif dan membuang elemen yang korup.
 *
 * @param {Storage} [storageBackend=getDefaultStorageBackend()] - Objek backend penyimpanan
 * @returns {Array<Object>} Daftar tugas yang valid, atau [] jika kosong/korup
 */
export function loadAssignments(storageBackend = getDefaultStorageBackend()) {
  if (!storageBackend || typeof storageBackend.getItem !== 'function') {
    return [];
  }

  try {
    const rawData = storageBackend.getItem(STORAGE_KEY);

    if (rawData === null || rawData === undefined || typeof rawData !== 'string') {
      return [];
    }

    if (rawData.trim() === '') {
      return [];
    }

    const parsedData = JSON.parse(rawData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(isValidAssignmentItem);
  } catch (error) {
    console.warn('Gagal memuat tugas dari penyimpanan lokal:', error);
    return [];
  }
}
