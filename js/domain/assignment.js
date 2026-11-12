/**
 * Modul Domain: Entitas Assignment, Validasi Input, dan Perhitungan DueStatus
 * Modul ini murni (pure functions) tanpa dependensi DOM.
 */

export const DUE_SOON_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const PRIORITY_WEIGHTS = Object.freeze({
  high: 3,
  medium: 2,
  low: 1
});

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

/**
 * Kelas error khusus untuk kegagalan validasi domain Assignment.
 */
export class ValidationError extends Error {
  /**
   * @param {string} message Pesan umum galat
   * @param {Record<string, string>} errors Peta field kesalahan dan keterangannya
   */
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Memvalidasi dan menyaring (sanitize) data masukan tugas.
 *
 * @param {Object} input Objek masukan tugas mentah
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitizedData: Object }}
 */
export function validateAssignmentInput(input = {}) {
  const errors = {};

  const title = input && input.title != null ? String(input.title).trim() : '';
  const course = input && input.course != null ? String(input.course).trim() : '';
  const dueDate = input && input.dueDate != null ? String(input.dueDate).trim() : '';
  const priority = input && input.priority != null && String(input.priority).trim() !== ''
    ? String(input.priority).trim().toLowerCase()
    : 'medium';
  const notes = input && input.notes != null ? String(input.notes) : '';

  // Validasi title: wajib diisi, 1-100 karakter
  if (!title) {
    errors.title = 'Judul tugas wajib diisi.';
  } else if (title.length > 100) {
    errors.title = 'Judul tugas tidak boleh melebihi 100 karakter.';
  }

  // Validasi course: wajib diisi, 1-50 karakter
  if (!course) {
    errors.course = 'Mata kuliah wajib diisi.';
  } else if (course.length > 50) {
    errors.course = 'Mata kuliah tidak boleh melebihi 50 karakter.';
  }

  // Validasi dueDate: format tanggal valid (tanggal masa lalu diperbolehkan)
  if (!dueDate || isNaN(new Date(dueDate).getTime())) {
    errors.dueDate = 'Tenggat waktu harus berupa format tanggal dan waktu yang valid.';
  }

  // Validasi priority: low | medium | high
  if (!VALID_PRIORITIES.has(priority)) {
    errors.priority = 'Prioritas harus bernilai "low", "medium", atau "high".';
  }

  // Validasi notes: opsional, maksimal 500 karakter
  if (notes.length > 500) {
    errors.notes = 'Catatan tambahan tidak boleh melebihi 500 karakter.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedData: {
      title,
      course,
      dueDate,
      priority,
      notes
    }
  };
}

/**
 * Membuat objek entitas Assignment baru setelah validasi.
 *
 * @param {Object} rawInput Objek masukan tugas mentah
 * @returns {Object} Objek entitas Assignment lengkap
 * @throws {ValidationError} Jika data masukan tidak lolos validasi
 */
export function createAssignment(rawInput) {
  const validation = validateAssignmentInput(rawInput);

  if (!validation.isValid) {
    throw new ValidationError('Validasi data tugas gagal.', validation.errors);
  }

  const { title, course, dueDate, priority, notes } = validation.sanitizedData;

  return {
    id: crypto.randomUUID(),
    title,
    course,
    dueDate,
    status: 'pending',
    priority,
    notes,
    createdAt: new Date().toISOString()
  };
}

/**
 * Menghitung status urgensi tenggat waktu tugas berdasarkan waktu acuan now.
 *
 * @param {Object} assignment Entitas tugas yang memuat properti status dan dueDate
 * @param {Date} [now=new Date()] Objek waktu acuan
 * @returns {'normal' | 'due-soon' | 'overdue'}
 */
export function calculateDueStatus(assignment, now = new Date()) {
  if (assignment.status === 'completed') {
    return 'normal';
  }

  const dueTime = new Date(assignment.dueDate).getTime();
  const currentTime = new Date(now).getTime();
  const diffMs = dueTime - currentTime;

  if (diffMs <= 0) {
    return 'overdue';
  }

  if (diffMs <= DUE_SOON_THRESHOLD_MS) {
    return 'due-soon';
  }

  return 'normal';
}
