/**
 * Entry Point Aplikasi: Tracker Tugas Kuliah
 *
 * Mengikat modul domain, modul penyimpanan, dan antarmuka pengguna (UI)
 * ke dalam siklus aplikasi interaktif, menangani event form, toggle, filter,
 * dan interval pembaharuan berkala dueStatus.
 */

import { validateAssignmentInput, createAssignment } from './domain/assignment.js';
import { sortAssignments } from './domain/sorting.js';
import { filterAssignments, extractUniqueCourses } from './domain/filter.js';
import { loadAssignments, saveAssignments } from './storage/storage.js';
import {
  renderAssignmentList,
  updateCourseOptions,
  showFormErrors,
  clearFormErrors
} from './ui.js';

/**
 * Menginisialisasi aplikasi pelacak tugas kuliah.
 *
 * @param {Object} [options={}] Opsi inisialisasi untuk pengujian atau lingkungan produksi
 * @returns {Object} Objek kontrol aplikasi dengan method refresh dan destroy
 */
export function initializeApp(options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  const win = options.windowObj || (typeof window !== 'undefined' ? window : null);
  const storage = options.storageBackend !== undefined ? options.storageBackend : (win?.localStorage || null);
  const nowFn = options.nowFn || (() => new Date());
  const intervalMs = options.intervalMs || 60000;

  // Resolusi elemen DOM
  const elements = options.elements || {
    form: doc.getElementById('assignment-form'),
    titleInput: doc.getElementById('assignment-title'),
    titleError: doc.getElementById('title-error'),
    courseInput: doc.getElementById('assignment-course'),
    courseError: doc.getElementById('course-error'),
    courseSuggestions: doc.getElementById('course-suggestions'),
    dueDateInput: doc.getElementById('assignment-due-date'),
    dueDateError: doc.getElementById('due-date-error'),
    prioritySelect: doc.getElementById('assignment-priority'),
    notesTextarea: doc.getElementById('assignment-notes'),
    submitButton: doc.getElementById('submit-button'),
    filterStatus: doc.getElementById('filter-status'),
    filterCourse: doc.getElementById('filter-course'),
    sortBy: doc.getElementById('sort-by'),
    assignmentList: doc.getElementById('assignment-list'),
    emptyState: doc.getElementById('empty-state')
  };

  // State aplikasi
  const state = {
    assignments: loadAssignments(storage),
    filters: {
      status: elements.filterStatus?.value || 'all',
      course: elements.filterCourse?.value || 'all'
    },
    sortBy: elements.sortBy?.value || 'dueDate'
  };

  /**
   * Merender seluruh komponen antarmuka berdasarkan state saat ini.
   */
  function render() {
    const currentNow = nowFn();

    // 1. Ekstrak mata kuliah unik dan perbarui opsi
    const uniqueCourses = extractUniqueCourses(state.assignments);
    if (elements.filterCourse) {
      updateCourseOptions(
        elements.filterCourse,
        elements.courseSuggestions,
        uniqueCourses,
        state.filters.course
      );
      state.filters.course = elements.filterCourse.value;
    }

    // 2. Filter & Sort data tugas
    const filtered = filterAssignments(state.assignments, state.filters);
    const sorted = sortAssignments(filtered, state.sortBy, currentNow);

    // 3. Render daftar ke kontainer DOM
    if (elements.assignmentList) {
      renderAssignmentList(elements.assignmentList, elements.emptyState, sorted, currentNow);
    }
  }

  // Event Listener: Submit Formulir
  function handleSubmit(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const rawData = {
      title: elements.titleInput?.value,
      course: elements.courseInput?.value,
      dueDate: elements.dueDateInput?.value,
      priority: elements.prioritySelect?.value,
      notes: elements.notesTextarea?.value
    };

    const validation = validateAssignmentInput(rawData);

    if (!validation.isValid) {
      if (elements.form) {
        showFormErrors(elements.form, validation.errors);
      }
      return;
    }

    // Bersihkan error jika input valid
    if (elements.form) {
      clearFormErrors(elements.form);
    }

    // Buat entitas tugas baru
    const newAssignment = createAssignment(validation.sanitizedData);
    state.assignments.push(newAssignment);
    saveAssignments(state.assignments, storage);

    // Reset formulir & fokus kembali ke judul tugas
    if (elements.form && typeof elements.form.reset === 'function') {
      elements.form.reset(); if (elements.titleInput) elements.titleInput.value = ''; if (elements.courseInput) elements.courseInput.value = ''; if (elements.dueDateInput) elements.dueDateInput.value = ''; if (elements.notesTextarea) elements.notesTextarea.value = '';
    }
    if (elements.prioritySelect) {
      elements.prioritySelect.value = 'medium';
    }
    if (elements.titleInput && typeof elements.titleInput.focus === 'function') {
      elements.titleInput.focus();
    }

    render();
  }

  // Event Delegator untuk List: Toggle Status & Hapus Tugas
  function handleListAction(event) {
    const target = event.target;
    if (!target) return;

    // Aksi Toggle Status Checkbox
    if (target.classList?.contains('assignment-checkbox') || target.getAttribute?.('data-action') === 'toggle') {
      const id = target.getAttribute('data-id') || target.closest?.('.assignment-item')?.getAttribute('data-id');
      const assignment = state.assignments.find(a => a.id === id);
      if (assignment) {
        assignment.status = assignment.status === 'completed' ? 'pending' : 'completed';
        saveAssignments(state.assignments, storage);
        render();
      }
      return;
    }

    // Aksi Hapus Tugas
    if (target.classList?.contains('delete-btn') || target.getAttribute?.('data-action') === 'delete') {
      const id = target.getAttribute('data-id') || target.closest?.('.assignment-item')?.getAttribute('data-id');
      const confirmFn = win?.confirm || (typeof confirm !== 'undefined' ? confirm : () => true);
      const isConfirmed = confirmFn('Apakah Anda yakin ingin menghapus tugas ini?');

      if (isConfirmed) {
        state.assignments = state.assignments.filter(a => a.id !== id);
        saveAssignments(state.assignments, storage);
        render();
      }
    }
  }

  // Event Listener: Filter Status
  function handleFilterStatusChange(e) {
    state.filters.status = e.target.value;
    render();
  }

  // Event Listener: Filter Course
  function handleFilterCourseChange(e) {
    state.filters.course = e.target.value;
    render();
  }

  // Event Listener: Sort By
  function handleSortChange(e) {
    state.sortBy = e.target.value;
    render();
  }

  // Pasang listeners
  if (elements.form) {
    elements.form.addEventListener('submit', handleSubmit);
  }

  if (elements.assignmentList) {
    elements.assignmentList.addEventListener('click', handleListAction);
    elements.assignmentList.addEventListener('change', handleListAction);
  }

  if (elements.filterStatus) {
    elements.filterStatus.addEventListener('change', handleFilterStatusChange);
  }

  if (elements.filterCourse) {
    elements.filterCourse.addEventListener('change', handleFilterCourseChange);
  }

  if (elements.sortBy) {
    elements.sortBy.addEventListener('change', handleSortChange);
  }

  // Render awal
  render();

  // Interval timer 60 detik untuk memperbarui status urgensi berkala
  let timerId = null;
  if (typeof setInterval !== 'undefined') {
    timerId = setInterval(() => {
      render();
    }, intervalMs);

    if (timerId && typeof timerId.unref === 'function') {
      timerId.unref();
    }
  }

  return {
    getState: () => ({ ...state }),
    refresh: () => render(),
    destroy: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  };
}

// Inisialisasi otomatis jika dimuat di lingkungan browser peramban
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeApp());
  } else {
    initializeApp();
  }
}
