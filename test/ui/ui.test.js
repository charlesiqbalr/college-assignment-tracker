import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import {
  createAssignmentItemElement,
  renderAssignmentList,
  updateCourseOptions,
  showFormErrors,
  clearFormErrors
} from '../../js/ui.js';

import { initializeApp } from '../../js/app.js';

/**
 * Simulasi / Mock DOM Ringan untuk Lingkungan Node.js tanpa dependensi eksternal.
 */
class MockClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }

  add(...classNames) {
    for (const cls of classNames) {
      if (cls) this.classes.add(cls);
    }
  }

  remove(...classNames) {
    for (const cls of classNames) {
      this.classes.delete(cls);
    }
  }

  contains(cls) {
    return this.classes.has(cls);
  }

  toggle(cls, force) {
    if (force !== undefined) {
      if (force) this.add(cls);
      else this.remove(cls);
      return force;
    }
    if (this.contains(cls)) {
      this.remove(cls);
      return false;
    }
    this.add(cls);
    return true;
  }

  toString() {
    return Array.from(this.classes).join(' ');
  }
}

class MockElement {
  constructor(tagName = 'div', ownerDoc = null) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.ownerDocument = ownerDoc;
    this.attributes = new Map();
    this.dataset = {};
    this.classList = new MockClassList(this);
    this.listeners = new Map();
    this._textContent = '';
    this.hidden = false;
    this.value = '';
    this.checked = false;
    this.focused = false;
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(val) {
    this.setAttribute('id', val);
  }

  get className() {
    return this.classList.toString();
  }

  set className(val) {
    this.classList.classes.clear();
    if (val) {
      val.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  get textContent() {
    if (this.children.length === 0) {
      return this._textContent;
    }
    return this.children.map(child => child.textContent).join('');
  }

  set textContent(val) {
    this.children = [];
    this._textContent = String(val);
  }

  get innerHTML() {
    return this.children.map(c => `<${c.tagName.toLowerCase()}>${c.textContent}</${c.tagName.toLowerCase()}>`).join('');
  }

  set innerHTML(val) {
    if (val === '') {
      this.children = [];
      this._textContent = '';
    } else {
      this.children = [];
      this._textContent = val;
    }
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[key] = String(value);
    }
    if (name === 'class') {
      this.className = String(value);
    }
    if (name === 'hidden') {
      this.hidden = true;
    }
  }

  getAttribute(name) {
    if (name === 'class') {
      return this.className;
    }
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[key];
    }
    if (name === 'hidden') {
      this.hidden = false;
    }
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  appendChild(child) {
    child.parentNode = this;
    if (this.ownerDocument) {
      child.ownerDocument = this.ownerDocument;
    }
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  replaceChildren(...newChildren) {
    this.children = [];
    for (const child of newChildren) {
      if (child) {
        this.appendChild(child);
      }
    }
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  dispatchEvent(event) {
    if (!event.target) {
      event.target = this;
    }
    let curr = this;
    while (curr) {
      event.currentTarget = curr;
      const handlers = curr.listeners.get(event.type) || [];
      for (const handler of handlers) {
        handler.call(curr, event);
      }
      curr = curr.parentNode;
    }
    return !event.defaultPrevented;
  }

  focus() {
    this.focused = true;
  }

  matches(selector) {
    if (selector.startsWith('.')) {
      const classes = selector.slice(1).split('.');
      return classes.every(c => this.classList.contains(c));
    }
    if (selector.startsWith('#')) {
      return this.id === selector.slice(1);
    }
    if (selector.startsWith('[')) {
      const attrMatch = selector.match(/\[([a-z-]+)(?:="?([^"\]]+)"?)?\]/i);
      if (attrMatch) {
        const attr = attrMatch[1];
        const val = attrMatch[2];
        return val !== undefined ? this.getAttribute(attr) === val : this.hasAttribute(attr);
      }
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) {
        return curr;
      }
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];

    const traverse = (node) => {
      for (const child of node.children) {
        if (child.matches && child.matches(selector)) {
          results.push(child);
        }
        traverse(child);
      }
    };

    traverse(this);
    return results;
  }

  reset() {
    // Khusus form
    for (const child of this.querySelectorAll('input, select, textarea')) {
      if (child.tagName === 'INPUT' && (child.getAttribute('type') === 'checkbox')) {
        child.checked = false;
      } else if (child.tagName === 'SELECT') {
        const firstOpt = child.children[0];
        child.value = firstOpt ? firstOpt.value : '';
      } else {
        child.value = '';
      }
    }
  }
}

class MockDocument {
  constructor() {
    this.elementsById = new Map();
  }

  createElement(tagName) {
    const el = new MockElement(tagName, this);
    return el;
  }

  createTextNode(text) {
    const el = new MockElement('#text', this);
    el.textContent = text;
    return el;
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }

  registerElement(id, element) {
    element.id = id;
    element.ownerDocument = this;
    this.elementsById.set(id, element);
    return element;
  }
}

class MockStorage {
  constructor(initialData = {}) {
    this.store = new Map(Object.entries(initialData));
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

function createDOMEnvironment() {
  const doc = new MockDocument();

  // Buat struktur elemen seperti pada index.html
  const form = doc.registerElement('assignment-form', doc.createElement('form'));
  const titleInput = doc.registerElement('assignment-title', doc.createElement('input'));
  titleInput.setAttribute('type', 'text');
  titleInput.setAttribute('name', 'title');
  const titleError = doc.registerElement('title-error', doc.createElement('span'));
  titleError.className = 'error-text';

  const courseInput = doc.registerElement('assignment-course', doc.createElement('input'));
  courseInput.setAttribute('type', 'text');
  courseInput.setAttribute('name', 'course');
  const courseError = doc.registerElement('course-error', doc.createElement('span'));
  courseError.className = 'error-text';
  const courseSuggestions = doc.registerElement('course-suggestions', doc.createElement('datalist'));

  const dueDateInput = doc.registerElement('assignment-due-date', doc.createElement('input'));
  dueDateInput.setAttribute('type', 'datetime-local');
  dueDateInput.setAttribute('name', 'dueDate');
  const dueDateError = doc.registerElement('due-date-error', doc.createElement('span'));
  dueDateError.className = 'error-text';

  const prioritySelect = doc.registerElement('assignment-priority', doc.createElement('select'));
  prioritySelect.setAttribute('name', 'priority');
  const optLow = doc.createElement('option');
  optLow.value = 'low';
  optLow.textContent = 'Rendah';
  const optMed = doc.createElement('option');
  optMed.value = 'medium';
  optMed.textContent = 'Sedang';
  const optHigh = doc.createElement('option');
  optHigh.value = 'high';
  optHigh.textContent = 'Tinggi';
  prioritySelect.appendChild(optLow);
  prioritySelect.appendChild(optMed);
  prioritySelect.appendChild(optHigh);
  prioritySelect.value = 'medium';

  const notesTextarea = doc.registerElement('assignment-notes', doc.createElement('textarea'));
  notesTextarea.setAttribute('name', 'notes');

  const submitButton = doc.registerElement('submit-button', doc.createElement('button'));
  submitButton.setAttribute('type', 'submit');

  form.appendChild(titleInput);
  form.appendChild(titleError);
  form.appendChild(courseInput);
  form.appendChild(courseError);
  form.appendChild(courseSuggestions);
  form.appendChild(dueDateInput);
  form.appendChild(dueDateError);
  form.appendChild(prioritySelect);
  form.appendChild(notesTextarea);
  form.appendChild(submitButton);

  const filterStatus = doc.registerElement('filter-status', doc.createElement('select'));
  for (const [val, label] of [['all', 'Semua'], ['pending', 'Belum Selesai'], ['completed', 'Selesai']]) {
    const opt = doc.createElement('option');
    opt.value = val;
    opt.textContent = label;
    filterStatus.appendChild(opt);
  }
  filterStatus.value = 'all';

  const filterCourse = doc.registerElement('filter-course', doc.createElement('select'));
  const optAllCourse = doc.createElement('option');
  optAllCourse.value = 'all';
  optAllCourse.textContent = 'Semua Mata Kuliah';
  filterCourse.appendChild(optAllCourse);
  filterCourse.value = 'all';

  const sortBy = doc.registerElement('sort-by', doc.createElement('select'));
  for (const [val, label] of [['dueDate', 'Tenggat Waktu'], ['priority', 'Tingkat Prioritas']]) {
    const opt = doc.createElement('option');
    opt.value = val;
    opt.textContent = label;
    sortBy.appendChild(opt);
  }
  sortBy.value = 'dueDate';

  const assignmentList = doc.registerElement('assignment-list', doc.createElement('ul'));
  const emptyState = doc.registerElement('empty-state', doc.createElement('p'));
  emptyState.textContent = 'Tidak ada tugas yang ditemukan.';
  emptyState.hidden = true;

  const mockWindow = {
    confirm: mock.fn(() => true)
  };

  return {
    document: doc,
    window: mockWindow,
    elements: {
      form,
      titleInput,
      titleError,
      courseInput,
      courseError,
      courseSuggestions,
      dueDateInput,
      dueDateError,
      prioritySelect,
      notesTextarea,
      submitButton,
      filterStatus,
      filterCourse,
      sortBy,
      assignmentList,
      emptyState
    }
  };
}

describe('UI: DOM Rendering, Form Validation, and Component Binding (Issue #6)', () => {
  describe('createAssignmentItemElement', () => {
    const baseNow = new Date('2026-11-13T10:00:00.000Z');

    it('merender elemen kartu tugas dengan aman menggunakan textContent (Pencegahan XSS)', () => {
      const { document: doc } = createDOMEnvironment();
      const xssAssignment = {
        id: 'task-xss-1',
        title: '<script>alert("hack")</script><b>Judul Aman</b>',
        course: '<img src=x onerror=alert(1)> Basis Data',
        dueDate: '2026-11-15T10:00:00.000Z',
        status: 'pending',
        priority: 'high',
        notes: '<script>window.steal()</script>',
        createdAt: '2026-11-12T10:00:00.000Z'
      };

      const itemEl = createAssignmentItemElement(xssAssignment, baseNow, doc);

      assert.equal(itemEl.tagName, 'LI');
      assert.ok(itemEl.classList.contains('assignment-item'), 'Harus memiliki kelas .assignment-item');
      assert.equal(itemEl.dataset.id, 'task-xss-1');
      assert.equal(itemEl.dataset.status, 'pending');

      // Verifikasi bahwa title dirender via textContent persis aslinya
      const titleEl = itemEl.querySelector('.assignment-title');
      assert.ok(titleEl, 'Elemen .assignment-title harus ada');
      assert.equal(titleEl.textContent, '<script>alert("hack")</script><b>Judul Aman</b>');

      // Pastikan tidak ada elemen bersarang script atau img di dalam kartu
      const scripts = itemEl.querySelectorAll('script');
      assert.equal(scripts.length, 0, 'Tidak boleh ada tag script yang terevaluasi di DOM');

      const imgs = itemEl.querySelectorAll('img');
      assert.equal(imgs.length, 0, 'Tidak boleh ada tag img yang dibuat dari XSS payload');

      // Notes
      const notesEl = itemEl.querySelector('.assignment-notes');
      assert.ok(notesEl, 'Elemen .assignment-notes harus ada jika notes terisi');
      assert.equal(notesEl.textContent, '<script>window.steal()</script>');
    });

    it('merender penanda visual status overdue untuk tugas pending yang tenggatnya lewat', () => {
      const { document: doc } = createDOMEnvironment();
      const overdueAssignment = {
        id: 'task-overdue-1',
        title: 'Tugas Terlambat',
        course: 'Sistem Operasi',
        dueDate: '2026-11-12T08:00:00.000Z', // 26 jam lalu
        status: 'pending',
        priority: 'high',
        notes: '',
        createdAt: '2026-11-10T10:00:00.000Z'
      };

      const itemEl = createAssignmentItemElement(overdueAssignment, baseNow, doc);

      assert.ok(itemEl.classList.contains('due-status-overdue'), 'Harus memiliki class .due-status-overdue');
      const badgeOverdue = itemEl.querySelector('.badge-overdue');
      assert.ok(badgeOverdue, 'Harus memiliki elemen lencana .badge-overdue');
      assert.match(badgeOverdue.textContent, /Terlambat/);
    });

    it('merender penanda visual status due-soon untuk tugas pending dengan sisa waktu <= 24 jam', () => {
      const { document: doc } = createDOMEnvironment();
      const dueSoonAssignment = {
        id: 'task-due-soon-1',
        title: 'Tugas Deadline Dekat',
        course: 'Jaringan Komputer',
        dueDate: '2026-11-13T20:00:00.000Z', // sisa 10 jam
        status: 'pending',
        priority: 'medium',
        notes: '',
        createdAt: '2026-11-10T10:00:00.000Z'
      };

      const itemEl = createAssignmentItemElement(dueSoonAssignment, baseNow, doc);

      assert.ok(itemEl.classList.contains('due-status-due-soon'), 'Harus memiliki class .due-status-due-soon');
      const badgeDueSoon = itemEl.querySelector('.badge-due-soon');
      assert.ok(badgeDueSoon, 'Harus memiliki elemen lencana .badge-due-soon');
      assert.match(badgeDueSoon.textContent, /Mendekati Tenggat/);
    });

    it('merender tugas completed dengan atribut data-status="completed", checkbox checked, dan badge selesai', () => {
      const { document: doc } = createDOMEnvironment();
      const completedAssignment = {
        id: 'task-completed-1',
        title: 'Tugas Sudah Rampung',
        course: 'Kalkulus',
        dueDate: '2026-11-10T08:00:00.000Z', // lewat tenggat tapi sudah selesai
        status: 'completed',
        priority: 'low',
        notes: 'Selesai tepat waktu',
        createdAt: '2026-11-05T10:00:00.000Z'
      };

      const itemEl = createAssignmentItemElement(completedAssignment, baseNow, doc);

      assert.equal(itemEl.dataset.status, 'completed');
      assert.equal(itemEl.classList.contains('due-status-overdue'), false, 'Tugas selesai tidak boleh diberi label overdue');

      const checkbox = itemEl.querySelector('.assignment-checkbox');
      assert.ok(checkbox, 'Checkbox tugas harus ada');
      assert.equal(checkbox.checked, true, 'Checkbox harus dalam kondisi tercentang');

      const badgeCompleted = itemEl.querySelector('.badge-completed');
      assert.ok(badgeCompleted, 'Harus memiliki badge .badge-completed');
      assert.match(badgeCompleted.textContent, /Selesai/);
    });

    it('merender lencana prioritas yang tepat (Tinggi, Sedang, Rendah)', () => {
      const { document: doc } = createDOMEnvironment();
      const priorities = [
        { priority: 'high', expectedClass: 'priority-high', expectedText: 'Prioritas: Tinggi' },
        { priority: 'medium', expectedClass: 'priority-medium', expectedText: 'Prioritas: Sedang' },
        { priority: 'low', expectedClass: 'priority-low', expectedText: 'Prioritas: Rendah' }
      ];

      for (const item of priorities) {
        const assignment = {
          id: `task-${item.priority}`,
          title: `Tugas ${item.priority}`,
          course: 'Matematika',
          dueDate: '2026-11-20T10:00:00.000Z',
          status: 'pending',
          priority: item.priority,
          notes: ''
        };
        const el = createAssignmentItemElement(assignment, baseNow, doc);
        const priorityBadge = el.querySelector(`.badge-priority.${item.expectedClass}`);
        assert.ok(priorityBadge, `Badge dengan kelas .badge-priority.${item.expectedClass} harus ada`);
        assert.equal(priorityBadge.textContent.trim(), item.expectedText);
      }
    });

    it('tidak merender elemen .assignment-notes jika catatan kosong', () => {
      const { document: doc } = createDOMEnvironment();
      const noNotesAssignment = {
        id: 'task-no-notes',
        title: 'Tugas Tanpa Catatan',
        course: 'Fisika',
        dueDate: '2026-11-20T10:00:00.000Z',
        status: 'pending',
        priority: 'medium',
        notes: ''
      };
      const el = createAssignmentItemElement(noNotesAssignment, baseNow, doc);
      const notesEl = el.querySelector('.assignment-notes');
      assert.equal(notesEl, null, 'Elemen .assignment-notes tidak boleh dirender jika notes kosong');
    });
  });

  describe('renderAssignmentList', () => {
    it('menampilkan elemen emptyState saat daftar tugas kosong dan mengosongkan kontainer', () => {
      const { elements, document: doc } = createDOMEnvironment();
      const listEl = elements.assignmentList;
      const emptyStateEl = elements.emptyState;

      // Tambahkan item dummy awal
      const dummy = doc.createElement('li');
      listEl.appendChild(dummy);
      emptyStateEl.hidden = true;

      renderAssignmentList(listEl, emptyStateEl, []);

      assert.equal(listEl.children.length, 0, 'Kontainer daftar tugas harus dikosongkan');
      assert.equal(emptyStateEl.hidden, false, 'Elemen empty state harus ditampilkan (hidden = false)');
    });

    it('merender setiap tugas dan menyembunyikan emptyState saat daftar tugas terisi', () => {
      const { elements } = createDOMEnvironment();
      const listEl = elements.assignmentList;
      const emptyStateEl = elements.emptyState;
      emptyStateEl.hidden = false;

      const assignments = [
        {
          id: '1',
          title: 'Tugas 1',
          course: 'Algoritma',
          dueDate: '2026-11-20T10:00:00.000Z',
          status: 'pending',
          priority: 'high',
          notes: ''
        },
        {
          id: '2',
          title: 'Tugas 2',
          course: 'Struktur Data',
          dueDate: '2026-11-21T10:00:00.000Z',
          status: 'completed',
          priority: 'medium',
          notes: ''
        }
      ];

      renderAssignmentList(listEl, emptyStateEl, assignments);

      assert.equal(emptyStateEl.hidden, true, 'Elemen empty state harus disembunyikan');
      assert.equal(listEl.children.length, 2, 'Dua item tugas harus dirender ke kontainer');
      assert.equal(listEl.children[0].dataset.id, '1');
      assert.equal(listEl.children[1].dataset.id, '2');
    });
  });

  describe('updateCourseOptions', () => {
    it('memperbarui elemen filter-course dan suggestions datalist dengan daftar mata kuliah unik', () => {
      const { elements } = createDOMEnvironment();
      const selectEl = elements.filterCourse;
      const datalistEl = elements.courseSuggestions;

      const uniqueCourses = ['Algoritma', 'Basis Data', 'Sistem Operasi'];
      updateCourseOptions(selectEl, datalistEl, uniqueCourses, 'all');

      // Dropdown filter: Opsi "Semua Mata Kuliah" + 3 opsi mata kuliah
      assert.equal(selectEl.children.length, 4);
      assert.equal(selectEl.children[0].value, 'all');
      assert.equal(selectEl.children[0].textContent, 'Semua Mata Kuliah');
      assert.equal(selectEl.children[1].value, 'Algoritma');
      assert.equal(selectEl.children[2].value, 'Basis Data');
      assert.equal(selectEl.children[3].value, 'Sistem Operasi');
      assert.equal(selectEl.value, 'all');

      // Datalist: 3 opsi mata kuliah
      assert.equal(datalistEl.children.length, 3);
      assert.equal(datalistEl.children[0].value, 'Algoritma');
      assert.equal(datalistEl.children[1].value, 'Basis Data');
      assert.equal(datalistEl.children[2].value, 'Sistem Operasi');
    });

    it('mempertahankan opsi filter yang sedang dipilih jika masih ada dalam daftar unik', () => {
      const { elements } = createDOMEnvironment();
      const selectEl = elements.filterCourse;
      const datalistEl = elements.courseSuggestions;

      updateCourseOptions(selectEl, datalistEl, ['Algoritma', 'Basis Data'], 'Basis Data');
      assert.equal(selectEl.value, 'Basis Data');

      // Jika opsi yang sebelumnya dipilih sudah tidak ada, reset ke 'all'
      updateCourseOptions(selectEl, datalistEl, ['Algoritma'], 'Basis Data');
      assert.equal(selectEl.value, 'all');
    });
  });

  describe('showFormErrors & clearFormErrors', () => {
    it('menampilkan pesan galat pada elemen error aria-live dan menambahkan kelas input-error', () => {
      const { elements } = createDOMEnvironment();
      const form = elements.form;

      const errors = {
        title: 'Judul tugas wajib diisi.',
        course: 'Mata kuliah wajib diisi.'
      };

      showFormErrors(form, errors);

      assert.equal(elements.titleError.textContent, 'Judul tugas wajib diisi.');
      assert.ok(elements.titleInput.classList.contains('input-error'));
      assert.equal(elements.courseError.textContent, 'Mata kuliah wajib diisi.');
      assert.ok(elements.courseInput.classList.contains('input-error'));

      // Input pertama yang salah harus difokuskan
      assert.equal(elements.titleInput.focused, true);
    });

    it('membersihkan seluruh pesan galat dan kelas input-error dengan clearFormErrors', () => {
      const { elements } = createDOMEnvironment();
      const form = elements.form;

      showFormErrors(form, { title: 'Galat' });
      assert.equal(elements.titleError.textContent, 'Galat');

      clearFormErrors(form);

      assert.equal(elements.titleError.textContent, '');
      assert.equal(elements.titleInput.classList.contains('input-error'), false);
    });
  });

  describe('Alur Interaksi Terintegrasi (initializeApp)', () => {
    it('menangani penambahan tugas: submit valid -> tersimpan di storage -> render di list -> form direset & fokus kembali ke judul', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window,
        nowFn: () => new Date('2026-11-13T10:00:00.000Z')
      });

      // Simulasikan pengisian form
      env.elements.titleInput.value = 'Tugas Pemrograman Web';
      env.elements.courseInput.value = 'Pemrograman Web';
      env.elements.dueDateInput.value = '2026-11-18T23:59';
      env.elements.prioritySelect.value = 'high';
      env.elements.notesTextarea.value = 'Implementasi HTML & JS';

      // Submit form
      const submitEvent = { type: 'submit', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      env.elements.form.dispatchEvent(submitEvent);

      assert.ok(submitEvent.defaultPrevented, 'Submit form harus di-intercept via preventDefault');

      // Verifikasi tugas ter-render di daftar
      assert.equal(env.elements.assignmentList.children.length, 1);
      const renderedItem = env.elements.assignmentList.children[0];
      assert.equal(renderedItem.querySelector('.assignment-title').textContent, 'Tugas Pemrograman Web');
      assert.ok(renderedItem.querySelector('.badge-priority.priority-high'));

      // Verifikasi form di-reset dan titleInput difokuskan
      assert.equal(env.elements.titleInput.value, '');
      assert.equal(env.elements.titleInput.focused, true);

      // Verifikasi tersimpan di storage
      const savedRaw = storage.getItem('college_assignment_tracker_v1');
      assert.ok(savedRaw);
      const savedList = JSON.parse(savedRaw);
      assert.equal(savedList.length, 1);
      assert.equal(savedList[0].title, 'Tugas Pemrograman Web');

      // Verifikasi datalist dan filter-course diperbarui dengan mata kuliah baru
      assert.equal(env.elements.courseSuggestions.children.length, 1);
      assert.equal(env.elements.courseSuggestions.children[0].value, 'Pemrograman Web');

      app.destroy();
    });

    it('menangani validasi form: submit kosong -> tidak tersimpan -> pesan error tampil -> fokus ke judul', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window
      });

      env.elements.titleInput.value = '   ';
      env.elements.courseInput.value = '';
      env.elements.titleInput.focused = false;

      const submitEvent = { type: 'submit', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      env.elements.form.dispatchEvent(submitEvent);

      assert.ok(submitEvent.defaultPrevented);
      assert.equal(env.elements.assignmentList.children.length, 0);
      assert.equal(env.elements.emptyState.hidden, false);
      assert.equal(env.elements.titleError.textContent, 'Judul tugas wajib diisi.');
      assert.equal(env.elements.titleInput.focused, true);

      app.destroy();
    });

    it('menangani toggle status checkbox: pending -> completed -> tersimpan di storage dan tampilan terupdate', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      // Inisialisasi awal dengan 1 tugas pending
      const initialTask = {
        id: 'task-100',
        title: 'Tugas Toggle',
        course: 'Jaringan',
        dueDate: '2026-11-20T10:00:00.000Z',
        status: 'pending',
        priority: 'medium',
        notes: '',
        createdAt: '2026-11-10T10:00:00.000Z'
      };
      storage.setItem('college_assignment_tracker_v1', JSON.stringify([initialTask]));

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window
      });

      assert.equal(env.elements.assignmentList.children.length, 1);
      const itemEl = env.elements.assignmentList.children[0];
      const checkbox = itemEl.querySelector('.assignment-checkbox');
      assert.equal(checkbox.checked, false);

      // Simulasikan event click / change checkbox
      checkbox.checked = true;
      checkbox.dispatchEvent({ type: 'change', target: checkbox });

      // Verifikasi state dan storage berubah jadi completed
      const savedData = JSON.parse(storage.getItem('college_assignment_tracker_v1'));
      assert.equal(savedData[0].status, 'completed');

      // Verifikasi render ulang
      const updatedItem = env.elements.assignmentList.children[0];
      assert.equal(updatedItem.dataset.status, 'completed');
      assert.ok(updatedItem.querySelector('.badge-completed'));

      app.destroy();
    });

    it('menangani konfirmasi hapus tugas: batal (Cancel) -> tugas tidak dihapus; setuju (OK) -> tugas terhapus', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      const initialTask = {
        id: 'task-del-1',
        title: 'Tugas Dihapus',
        course: 'Kalkulus',
        dueDate: '2026-11-20T10:00:00.000Z',
        status: 'pending',
        priority: 'low',
        notes: '',
        createdAt: '2026-11-10T10:00:00.000Z'
      };
      storage.setItem('college_assignment_tracker_v1', JSON.stringify([initialTask]));

      // 1. Pengguna membatalkan (window.confirm return false)
      env.window.confirm = mock.fn(() => false);

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window
      });

      let deleteBtn = env.elements.assignmentList.children[0].querySelector('.delete-btn');
      deleteBtn.dispatchEvent({ type: 'click', target: deleteBtn });

      assert.equal(env.window.confirm.mock.calls.length, 1);
      assert.equal(env.elements.assignmentList.children.length, 1, 'Tugas tidak boleh dihapus saat confirm false');

      // 2. Pengguna menyetujui (window.confirm return true)
      env.window.confirm = mock.fn(() => true);
      deleteBtn = env.elements.assignmentList.children[0].querySelector('.delete-btn');
      deleteBtn.dispatchEvent({ type: 'click', target: deleteBtn });

      assert.equal(env.window.confirm.mock.calls.length, 1);
      assert.equal(env.elements.assignmentList.children.length, 0, 'Tugas harus dihapus dari DOM');
      assert.equal(env.elements.emptyState.hidden, false, 'Empty state harus muncul setelah daftar kosong');

      const savedData = JSON.parse(storage.getItem('college_assignment_tracker_v1'));
      assert.equal(savedData.length, 0, 'Storage harus kosong');

      app.destroy();
    });

    it('menangani perubahan filter status dan filter mata kuliah secara real-time', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      const tasks = [
        {
          id: '1',
          title: 'Tugas Web 1',
          course: 'Pemrograman Web',
          dueDate: '2026-11-20T10:00:00.000Z',
          status: 'pending',
          priority: 'high',
          notes: ''
        },
        {
          id: '2',
          title: 'Tugas Web 2',
          course: 'Pemrograman Web',
          dueDate: '2026-11-21T10:00:00.000Z',
          status: 'completed',
          priority: 'low',
          notes: ''
        },
        {
          id: '3',
          title: 'Tugas Alpro 1',
          course: 'Algoritma',
          dueDate: '2026-11-22T10:00:00.000Z',
          status: 'pending',
          priority: 'medium',
          notes: ''
        }
      ];
      storage.setItem('college_assignment_tracker_v1', JSON.stringify(tasks));

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window
      });

      assert.equal(env.elements.assignmentList.children.length, 3);

      // Filter status: pending
      env.elements.filterStatus.value = 'pending';
      env.elements.filterStatus.dispatchEvent({ type: 'change', target: env.elements.filterStatus });

      assert.equal(env.elements.assignmentList.children.length, 2);

      // Filter course: Pemrograman Web (pending + Pemrograman Web -> 1 tugas)
      env.elements.filterCourse.value = 'Pemrograman Web';
      env.elements.filterCourse.dispatchEvent({ type: 'change', target: env.elements.filterCourse });

      assert.equal(env.elements.assignmentList.children.length, 1);
      assert.equal(env.elements.assignmentList.children[0].dataset.id, '1');

      app.destroy();
    });

    it('menjalankan interval timer 60 detik untuk memperbarui status urgensi tugas aktif', () => {
      const env = createDOMEnvironment();
      const storage = new MockStorage();

      let currentTime = new Date('2026-11-13T10:00:00.000Z');
      const nowFn = () => currentTime;

      // Tugas tenggatnya tepat 1 menit lagi dari currentTime (masih due-soon)
      const tasks = [
        {
          id: 'task-timer-1',
          title: 'Tugas Detik Terakhir',
          course: 'Fisika',
          dueDate: '2026-11-13T10:01:00.000Z',
          status: 'pending',
          priority: 'medium',
          notes: ''
        }
      ];
      storage.setItem('college_assignment_tracker_v1', JSON.stringify(tasks));

      const app = initializeApp({
        document: env.document,
        elements: env.elements,
        storageBackend: storage,
        windowObj: env.window,
        nowFn,
        intervalMs: 60000
      });

      // Awalnya: due-soon (karena sisa 1 menit <= 24 jam)
      let itemEl = env.elements.assignmentList.children[0];
      assert.ok(itemEl.classList.contains('due-status-due-soon'));

      // Majukan waktu 2 menit sehingga melewati tenggat waktu
      currentTime = new Date('2026-11-13T10:02:00.000Z');

      // Picu tick timer secara manual melalui method internal app.refresh()
      app.refresh();

      itemEl = env.elements.assignmentList.children[0];
      assert.ok(itemEl.classList.contains('due-status-overdue'), 'Status harus beralih ke overdue setelah interval refresh');

      app.destroy();
    });
  });
});
