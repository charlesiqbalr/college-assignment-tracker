import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAssignmentInput,
  createAssignment,
  calculateDueStatus,
  ValidationError,
  DUE_SOON_THRESHOLD_MS,
  PRIORITY_WEIGHTS
} from '../../js/domain/assignment.js';

describe('Domain: Assignment Entity and Validation', () => {
  describe('validateAssignmentInput', () => {
    it('menerima input valid lengkap dan mengembalikan data tersanitasi dengan isValid: true', () => {
      const rawInput = {
        title: '  Tugas Algoritma dan Pemrograman  ',
        course: '  Ilmu Komputer  ',
        dueDate: '2026-11-20T23:59',
        priority: 'high',
        notes: '  Kerjakan dengan Python murni  '
      };

      const result = validateAssignmentInput(rawInput);

      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
      assert.strictEqual(result.sanitizedData.title, 'Tugas Algoritma dan Pemrograman');
      assert.strictEqual(result.sanitizedData.course, 'Ilmu Komputer');
      assert.strictEqual(result.sanitizedData.dueDate, '2026-11-20T23:59');
      assert.strictEqual(result.sanitizedData.priority, 'high');
      assert.strictEqual(result.sanitizedData.notes, '  Kerjakan dengan Python murni  ');
    });

    it('menetapkan default priority "medium" dan notes "" bila tidak diisi', () => {
      const rawInput = {
        title: 'Tugas Basis Data',
        course: 'Sistem Informasi',
        dueDate: '2026-11-25T12:00'
      };

      const result = validateAssignmentInput(rawInput);

      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
      assert.strictEqual(result.sanitizedData.priority, 'medium');
      assert.strictEqual(result.sanitizedData.notes, '');
    });

    it('gagal validasi jika title kosong atau hanya berisi spasi kosong', () => {
      const resultEmpty = validateAssignmentInput({
        title: '',
        course: 'Matematika Diskrit',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(resultEmpty.isValid, false);
      assert.ok(resultEmpty.errors.title);

      const resultWhitespace = validateAssignmentInput({
        title: '     ',
        course: 'Matematika Diskrit',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(resultWhitespace.isValid, false);
      assert.ok(resultWhitespace.errors.title);
    });

    it('validasi batas title: tepat 100 karakter lolos, 101 karakter gagal', () => {
      const title100 = 'A'.repeat(100);
      const title101 = 'A'.repeat(101);

      const result100 = validateAssignmentInput({
        title: title100,
        course: 'Fisika Dasar',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(result100.isValid, true);
      assert.strictEqual(result100.sanitizedData.title.length, 100);

      const result101 = validateAssignmentInput({
        title: title101,
        course: 'Fisika Dasar',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(result101.isValid, false);
      assert.ok(result101.errors.title);
    });

    it('gagal validasi jika course kosong atau hanya berisi spasi kosong', () => {
      const resultEmpty = validateAssignmentInput({
        title: 'Tugas Jaringan',
        course: '',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(resultEmpty.isValid, false);
      assert.ok(resultEmpty.errors.course);

      const resultWhitespace = validateAssignmentInput({
        title: 'Tugas Jaringan',
        course: '    ',
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(resultWhitespace.isValid, false);
      assert.ok(resultWhitespace.errors.course);
    });

    it('validasi batas course: tepat 50 karakter lolos, 51 karakter gagal', () => {
      const course50 = 'C'.repeat(50);
      const course51 = 'C'.repeat(51);

      const result50 = validateAssignmentInput({
        title: 'Tugas Kalkulus',
        course: course50,
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(result50.isValid, true);
      assert.strictEqual(result50.sanitizedData.course.length, 50);

      const result51 = validateAssignmentInput({
        title: 'Tugas Kalkulus',
        course: course51,
        dueDate: '2026-11-20T10:00'
      });
      assert.strictEqual(result51.isValid, false);
      assert.ok(result51.errors.course);
    });

    it('gagal validasi jika dueDate bukan format tanggal yang valid', () => {
      const resultInvalidDate = validateAssignmentInput({
        title: 'Tugas Praktikum',
        course: 'Sistem Operasi',
        dueDate: 'bukan-tanggal-valid'
      });
      assert.strictEqual(resultInvalidDate.isValid, false);
      assert.ok(resultInvalidDate.errors.dueDate);
    });

    it('sukses validasi jika dueDate berada di masa lalu (rekam jejak akademik)', () => {
      const pastDate = '2020-01-01T08:00';
      const result = validateAssignmentInput({
        title: 'Tugas Masa Lalu',
        course: 'Sejarah Komputer',
        dueDate: pastDate
      });
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.sanitizedData.dueDate, pastDate);
    });

    it('gagal validasi jika priority bukan "low", "medium", atau "high"', () => {
      const result = validateAssignmentInput({
        title: 'Tugas Statistika',
        course: 'Statistika',
        dueDate: '2026-11-20T10:00',
        priority: 'urgent'
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.priority);
    });

    it('validasi batas notes: tepat 500 karakter lolos, 501 karakter gagal', () => {
      const notes500 = 'N'.repeat(500);
      const notes501 = 'N'.repeat(501);

      const result500 = validateAssignmentInput({
        title: 'Tugas AI',
        course: 'Kecerdasan Buatan',
        dueDate: '2026-11-20T10:00',
        notes: notes500
      });
      assert.strictEqual(result500.isValid, true);
      assert.strictEqual(result500.sanitizedData.notes.length, 500);

      const result501 = validateAssignmentInput({
        title: 'Tugas AI',
        course: 'Kecerdasan Buatan',
        dueDate: '2026-11-20T10:00',
        notes: notes501
      });
      assert.strictEqual(result501.isValid, false);
      assert.ok(result501.errors.notes);
    });
  });

  describe('createAssignment', () => {
    it('menghasilkan objek Assignment lengkap dengan id UUID unik, status pending, dan createdAt UTC', () => {
      const rawInput = {
        title: 'Proyek Akhir Web',
        course: 'Pemrograman Web',
        dueDate: '2026-11-30T23:59',
        priority: 'high',
        notes: 'Gunakan Vanilla JS murni'
      };

      const assignment = createAssignment(rawInput);

      assert.ok(assignment.id);
      // Validasi pola UUID v4 (8-4-4-4-12 hex string)
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      assert.match(assignment.id, uuidV4Regex);

      assert.strictEqual(assignment.title, 'Proyek Akhir Web');
      assert.strictEqual(assignment.course, 'Pemrograman Web');
      assert.strictEqual(assignment.dueDate, '2026-11-30T23:59');
      assert.strictEqual(assignment.status, 'pending');
      assert.strictEqual(assignment.priority, 'high');
      assert.strictEqual(assignment.notes, 'Gunakan Vanilla JS murni');

      // Validasi createdAt berformat ISO 8601 UTC
      assert.ok(assignment.createdAt);
      assert.strictEqual(new Date(assignment.createdAt).toISOString(), assignment.createdAt);
    });

    it('menghasilkan UUID yang berbeda pada setiap pembuatan', () => {
      const input = {
        title: 'Tugas 1',
        course: 'Alpro',
        dueDate: '2026-12-01T10:00'
      };

      const assignment1 = createAssignment(input);
      const assignment2 = createAssignment(input);

      assert.notStrictEqual(assignment1.id, assignment2.id);
    });

    it('melempar ValidationError jika input tidak valid', () => {
      const invalidInput = {
        title: '',
        course: '',
        dueDate: 'invalid'
      };

      assert.throws(
        () => createAssignment(invalidInput),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.strictEqual(error.name, 'ValidationError');
          assert.ok(error.errors.title);
          assert.ok(error.errors.course);
          assert.ok(error.errors.dueDate);
          return true;
        }
      );
    });
  });

  describe('calculateDueStatus', () => {
    const fixedNow = new Date('2026-11-12T12:00:00.000Z');

    it('mengembalikan "normal" bila tugas pending memiliki sisa waktu > 24 jam', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() + 25 * 60 * 60 * 1000).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'normal');
    });

    it('mengembalikan "due-soon" bila tugas pending memiliki sisa waktu tepat 24 jam', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() + DUE_SOON_THRESHOLD_MS).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'due-soon');
    });

    it('mengembalikan "normal" bila sisa waktu 24 jam ditambah 1 milidetik', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() + DUE_SOON_THRESHOLD_MS + 1).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'normal');
    });

    it('mengembalikan "due-soon" bila tugas pending memiliki sisa waktu di bawah 24 jam (misal 5 jam)', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() + 5 * 60 * 60 * 1000).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'due-soon');
    });

    it('mengembalikan "overdue" jika tepat pada waktu tenggat (selisih 0 ms)', () => {
      const assignment = {
        status: 'pending',
        dueDate: fixedNow.toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'overdue');
    });

    it('mengembalikan "overdue" bila now telah melewati dueDate (lewat 1 milidetik)', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() - 1).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'overdue');
    });

    it('mengembalikan "overdue" bila now telah melewati dueDate beberapa hari yang lalu', () => {
      const assignment = {
        status: 'pending',
        dueDate: new Date(fixedNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'overdue');
    });

    it('mengembalikan "normal" jika tugas berstatus completed meskipun dueDate telah lewat (overdue)', () => {
      const assignment = {
        status: 'completed',
        dueDate: new Date(fixedNow.getTime() - 24 * 60 * 60 * 1000).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'normal');
    });

    it('mengembalikan "normal" jika tugas berstatus completed dan dueDate berada di rentang due-soon', () => {
      const assignment = {
        status: 'completed',
        dueDate: new Date(fixedNow.getTime() + 2 * 60 * 60 * 1000).toISOString()
      };

      const status = calculateDueStatus(assignment, fixedNow);
      assert.strictEqual(status, 'normal');
    });
  });

  describe('Constants and Weights', () => {
    it('memiliki konstanta ambang DUE_SOON_THRESHOLD_MS sebesar 24 jam', () => {
      assert.strictEqual(DUE_SOON_THRESHOLD_MS, 24 * 60 * 60 * 1000);
    });

    it('memiliki PRIORITY_WEIGHTS yang sesuai spesifikasi', () => {
      assert.deepStrictEqual(PRIORITY_WEIGHTS, {
        high: 3,
        medium: 2,
        low: 1
      });
    });
  });
});
