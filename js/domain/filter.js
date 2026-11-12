/**
 * Modul Domain: Algoritma Penyaringan (Filtering) dan Ekstraksi Mata Kuliah Unik
 * Modul ini murni (pure functions) tanpa dependensi DOM dan tidak memutasi array asal.
 */

/**
 * Menyaring array assignments berdasarkan kriteria status dan nama mata kuliah.
 *
 * @param {Array<Object>} assignments Daftar tugas
 * @param {Object} [filters={}] Kriteria penyaringan
 * @param {'all'|'pending'|'completed'} [filters.status='all'] Filter status tugas
 * @param {string} [filters.course='all'] Filter nama mata kuliah
 * @returns {Array<Object>} Array baru hasil penyaringan
 */
export function filterAssignments(assignments, filters = {}) {
  if (!Array.isArray(assignments)) {
    return [];
  }

  const statusFilter = filters?.status;
  const courseFilter = filters?.course != null ? String(filters.course).trim() : null;

  return assignments.filter((assignment) => {
    if (!assignment) {
      return false;
    }

    // Filter status
    if (statusFilter && statusFilter !== 'all') {
      if (assignment.status !== statusFilter) {
        return false;
      }
    }

    // Filter course (case-insensitive)
    if (courseFilter && courseFilter.toLowerCase() !== 'all') {
      const assignmentCourse = assignment.course != null ? String(assignment.course).trim().toLowerCase() : '';
      if (assignmentCourse !== courseFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Mengekstrak daftar nama mata kuliah unik tanpa duplikasi dalam urutan alfabetis.
 *
 * @param {Array<Object>} assignments Daftar tugas
 * @returns {Array<string>} Array nama mata kuliah unik terurut alfabetis
 */
export function extractUniqueCourses(assignments) {
  if (!Array.isArray(assignments)) {
    return [];
  }

  const coursesSet = new Set();

  for (const item of assignments) {
    if (item && item.course != null) {
      const courseTrimmed = String(item.course).trim();
      if (courseTrimmed.length > 0) {
        coursesSet.add(courseTrimmed);
      }
    }
  }

  return Array.from(coursesSet).sort((a, b) => a.localeCompare(b));
}
