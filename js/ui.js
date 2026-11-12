/**
 * Modul Antarmuka Pengguna (UI)
 *
 * Mengelola rendering komponen DOM secara aman (pencegahan XSS via textContent),
 * pembaruan visual status urgensi, opsi filter, dan penanganan galat formulir.
 */

import { calculateDueStatus } from './domain/assignment.js';

/**
 * Memformat string ISO dueDate menjadi format tanggal dan waktu lokal yang ramah dibaca.
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatDueDate(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Mendapatkan referensi dokumen aktif.
 *
 * @param {HTMLElement} [element=null]
 * @param {Document} [explicitDoc=null]
 * @returns {Document | null}
 */
function resolveDocument(element = null, explicitDoc = null) {
  if (explicitDoc) return explicitDoc;
  if (element && element.ownerDocument) return element.ownerDocument;
  if (typeof document !== 'undefined') return document;
  return null;
}

/**
 * Membuat elemen kartu tugas <li> secara aman tanpa kerentanan XSS.
 *
 * @param {Object} assignment Entitas data tugas
 * @param {Date} [now=new Date()] Waktu acuan saat ini
 * @param {Document} [doc=null] Objek document
 * @returns {HTMLElement} Elemen <li> kartu tugas
 */
export function createAssignmentItemElement(assignment, now = new Date(), doc = null) {
  const documentObj = resolveDocument(null, doc);
  if (!documentObj) {
    throw new Error('Objek document tidak ditemukan untuk membuat elemen kartu tugas.');
  }

  const isCompleted = assignment.status === 'completed';
  const dueStatus = calculateDueStatus(assignment, now);

  const li = documentObj.createElement('li');
  li.className = 'assignment-item';
  li.setAttribute('data-id', assignment.id);
  li.setAttribute('data-status', assignment.status);

  // Penanda visual kelas due-status untuk tugas pending
  if (!isCompleted) {
    if (dueStatus === 'overdue') {
      li.classList.add('due-status-overdue');
    } else if (dueStatus === 'due-soon') {
      li.classList.add('due-status-due-soon');
    }
  }

  // Header: Checkbox + Judul + Tombol Hapus
  const header = documentObj.createElement('div');
  header.className = 'assignment-header';

  const titleGroup = documentObj.createElement('div');
  titleGroup.className = 'assignment-title-group';

  const checkbox = documentObj.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'assignment-checkbox';
  checkbox.checked = isCompleted;
  checkbox.setAttribute('aria-label', `Tandai selesai tugas ${assignment.title}`);
  checkbox.setAttribute('data-action', 'toggle');
  checkbox.setAttribute('data-id', assignment.id);

  const title = documentObj.createElement('h3');
  title.className = 'assignment-title';
  title.textContent = assignment.title; // Proteksi XSS via textContent

  titleGroup.appendChild(checkbox);
  titleGroup.appendChild(title);

  const deleteBtn = documentObj.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger delete-btn';
  deleteBtn.textContent = 'Hapus';
  deleteBtn.setAttribute('aria-label', `Hapus tugas ${assignment.title}`);
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', assignment.id);

  header.appendChild(titleGroup);
  header.appendChild(deleteBtn);
  li.appendChild(header);

  // Meta bar: Mata Kuliah, Tenggat, Badge Status, Badge Prioritas
  const meta = documentObj.createElement('div');
  meta.className = 'assignment-meta';

  const courseSpan = documentObj.createElement('span');
  courseSpan.className = 'assignment-course';
  courseSpan.textContent = `\u{1F4DA} ${assignment.course}`;
  meta.appendChild(courseSpan);

  const dueSpan = documentObj.createElement('span');
  dueSpan.className = 'assignment-due-date';
  dueSpan.textContent = `\u{1F4C5} ${formatDueDate(assignment.dueDate)}`;
  meta.appendChild(dueSpan);

  // Status Badge
  if (isCompleted) {
    const badgeCompleted = documentObj.createElement('span');
    badgeCompleted.className = 'badge badge-completed';
    badgeCompleted.textContent = '\u2705 Selesai';
    meta.appendChild(badgeCompleted);
  } else if (dueStatus === 'overdue') {
    const badgeOverdue = documentObj.createElement('span');
    badgeOverdue.className = 'badge badge-overdue';
    badgeOverdue.textContent = '\u26A0\uFE0F Terlambat';
    meta.appendChild(badgeOverdue);
  } else if (dueStatus === 'due-soon') {
    const badgeDueSoon = documentObj.createElement('span');
    badgeDueSoon.className = 'badge badge-due-soon';
    badgeDueSoon.textContent = '\u23F3 Mendekati Tenggat';
    meta.appendChild(badgeDueSoon);
  }

  // Priority Badge
  const priorityBadge = documentObj.createElement('span');
  const priorityMap = {
    high: { text: 'Prioritas: Tinggi', className: 'priority-high' },
    medium: { text: 'Prioritas: Sedang', className: 'priority-medium' },
    low: { text: 'Prioritas: Rendah', className: 'priority-low' }
  };
  const priorityInfo = priorityMap[assignment.priority] || priorityMap.medium;
  priorityBadge.className = `badge-priority ${priorityInfo.className}`;
  priorityBadge.textContent = priorityInfo.text;
  meta.appendChild(priorityBadge);

  li.appendChild(meta);

  // Catatan Tambahan (jika ada)
  if (assignment.notes && String(assignment.notes).trim() !== '') {
    const notesP = documentObj.createElement('p');
    notesP.className = 'assignment-notes';
    notesP.textContent = assignment.notes; // Proteksi XSS via textContent
    li.appendChild(notesP);
  }

  return li;
}

/**
 * Merender kumpulan tugas ke dalam wadah daftar `#assignment-list`.
 * Menangani tampilan status kosong `#empty-state` jika tidak ada tugas.
 *
 * @param {HTMLElement} listContainer Elemen kontainer <ul>
 * @param {HTMLElement} emptyStateElement Elemen pesan status kosong <p>
 * @param {Array<Object>} assignments Daftar tugas
 * @param {Date} [now=new Date()] Waktu acuan
 */
export function renderAssignmentList(listContainer, emptyStateElement, assignments = [], now = new Date()) {
  const documentObj = resolveDocument(listContainer);

  // Bersihkan isi kontainer sebelumnya
  listContainer.innerHTML = '';

  if (!assignments || assignments.length === 0) {
    if (emptyStateElement) {
      emptyStateElement.hidden = false;
      emptyStateElement.removeAttribute?.('hidden');
    }
    return;
  }

  if (emptyStateElement) {
    emptyStateElement.hidden = true;
    emptyStateElement.setAttribute?.('hidden', '');
  }

  for (const assignment of assignments) {
    const itemEl = createAssignmentItemElement(assignment, now, documentObj);
    listContainer.appendChild(itemEl);
  }
}

/**
 * Memperbarui opsi `<option>` pada dropdown filter mata kuliah dan datalist saran mata kuliah.
 *
 * @param {HTMLSelectElement} filterSelectElemen Elemen `<select id="filter-course">`
 * @param {HTMLElement} datalistElement Elemen `<datalist id="course-suggestions">`
 * @param {Array<string>} uniqueCourses Daftar mata kuliah unik terurut
 * @param {string} [currentSelected='all'] Nilai filter yang sedang aktif
 */
export function updateCourseOptions(filterSelectElemen, datalistElement, uniqueCourses = [], currentSelected = 'all') {
  const documentObj = resolveDocument(filterSelectElemen);
  if (!documentObj) return;

  // 1. Perbarui dropdown filter
  filterSelectElemen.innerHTML = '';

  const defaultOption = documentObj.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'Semua Mata Kuliah';
  filterSelectElemen.appendChild(defaultOption);

  let hasSelectedMatch = currentSelected === 'all';

  for (const course of uniqueCourses) {
    const option = documentObj.createElement('option');
    option.value = course;
    option.textContent = course;
    if (course === currentSelected) {
      hasSelectedMatch = true;
    }
    filterSelectElemen.appendChild(option);
  }

  filterSelectElemen.value = hasSelectedMatch ? currentSelected : 'all';

  // 2. Perbarui datalist saran
  if (datalistElement) {
    datalistElement.innerHTML = '';
    for (const course of uniqueCourses) {
      const option = documentObj.createElement('option');
      option.value = course;
      datalistElement.appendChild(option);
    }
  }
}

/**
 * Menampilkan pesan galat pada elemen `aria-live="polite"` dan menambahkan kelas `input-error` ke input.
 * Mengalihkan fokus ke elemen input pertama yang memiliki galat.
 *
 * @param {HTMLFormElement} formElement Elemen formulir
 * @param {Record<string, string>} errors Peta field kesalahan
 */
export function showFormErrors(formElement, errors = {}) {
  clearFormErrors(formElement);

  const fieldMapping = [
    { field: 'title', inputSelector: '#assignment-title', errorSelector: '#title-error' },
    { field: 'course', inputSelector: '#assignment-course', errorSelector: '#course-error' },
    { field: 'dueDate', inputSelector: '#assignment-due-date', errorSelector: '#due-date-error' },
    { field: 'priority', inputSelector: '#assignment-priority', errorSelector: null },
    { field: 'notes', inputSelector: '#assignment-notes', errorSelector: null }
  ];

  let firstErrorInput = null;

  for (const { field, inputSelector, errorSelector } of fieldMapping) {
    if (errors[field]) {
      const inputEl = formElement.querySelector(inputSelector);
      if (inputEl) {
        inputEl.classList.add('input-error');
        if (!firstErrorInput) {
          firstErrorInput = inputEl;
        }
      }

      if (errorSelector) {
        const errorEl = formElement.querySelector(errorSelector);
        if (errorEl) {
          errorEl.textContent = errors[field];
        }
      }
    }
  }

  if (firstErrorInput && typeof firstErrorInput.focus === 'function') {
    firstErrorInput.focus();
  }
}

/**
 * Membersihkan seluruh pesan galat dan kelas visual `input-error` pada formulir.
 *
 * @param {HTMLFormElement} formElement
 */
export function clearFormErrors(formElement) {
  const errorElements = formElement.querySelectorAll('.error-text');
  for (const el of errorElements) {
    el.textContent = '';
  }

  const inputs = formElement.querySelectorAll('.input-error');
  for (const input of inputs) {
    input.classList.remove('input-error');
  }
}
