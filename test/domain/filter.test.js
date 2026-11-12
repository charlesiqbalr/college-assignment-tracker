import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterAssignments, extractUniqueCourses } from '../../js/domain/filter.js';

describe('Domain: Filter Logic and Unique Courses', () => {
  const sampleAssignments = [
    {
      id: 'task-1',
      title: 'Tugas Kalkulus I',
      course: 'Matematika Terapan',
      dueDate: '2026-11-20T10:00',
      status: 'pending',
      priority: 'low'
    },
    {
      id: 'task-2',
      title: 'Proyek Akhir Web',
      course: 'Pemrograman Web',
      dueDate: '2026-11-15T23:59',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'task-3',
      title: 'Kuis Struktur Data',
      course: 'Struktur Data',
      dueDate: '2026-11-18T14:00',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'task-4',
      title: 'Latihan Matriks',
      course: 'Matematika Terapan',
      dueDate: '2026-11-05T08:00',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'task-5',
      title: 'Desain CSS Grid',
      course: 'pemrograman web',
      dueDate: '2026-11-22T12:00',
      status: 'pending',
      priority: 'medium'
    }
  ];

  describe('filterAssignments', () => {
    it('mengembalikan seluruh tugas saat filter status bernilai "all" dan course bernilai "all"', () => {
      const result = filterAssignments(sampleAssignments, { status: 'all', course: 'all' });
      assert.strictEqual(result.length, sampleAssignments.length);
      assert.deepStrictEqual(result, sampleAssignments);
    });

    it('mengembalikan seluruh tugas saat filters bernilai kosong atau tidak diberikan', () => {
      const resultEmptyObj = filterAssignments(sampleAssignments, {});
      assert.strictEqual(resultEmptyObj.length, sampleAssignments.length);

      const resultDefault = filterAssignments(sampleAssignments);
      assert.strictEqual(resultDefault.length, sampleAssignments.length);
    });

    it('menyaring hanya tugas berstatus "pending"', () => {
      const result = filterAssignments(sampleAssignments, { status: 'pending' });
      assert.strictEqual(result.length, 3);
      assert.ok(result.every(task => task.status === 'pending'));
      assert.deepStrictEqual(result.map(t => t.id), ['task-1', 'task-2', 'task-5']);
    });

    it('menyaring hanya tugas berstatus "completed"', () => {
      const result = filterAssignments(sampleAssignments, { status: 'completed' });
      assert.strictEqual(result.length, 2);
      assert.ok(result.every(task => task.status === 'completed'));
      assert.deepStrictEqual(result.map(t => t.id), ['task-3', 'task-4']);
    });

    it('menyaring tugas berdasarkan nama mata kuliah tertentu', () => {
      const result = filterAssignments(sampleAssignments, { course: 'Struktur Data' });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'task-3');
    });

    it('mengombinasikan filter status "pending" dan filter mata kuliah tertentu secara bersamaan', () => {
      const result = filterAssignments(sampleAssignments, {
        status: 'pending',
        course: 'Matematika Terapan'
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'task-1');
      assert.strictEqual(result[0].status, 'pending');
    });

    it('menyaring nama mata kuliah secara case-insensitive (misal: "pemrograman web" cocok dengan "Pemrograman Web")', () => {
      const result = filterAssignments(sampleAssignments, { course: 'PEMROGRAMAN WEB' });
      assert.strictEqual(result.length, 2);
      assert.deepStrictEqual(result.map(t => t.id), ['task-2', 'task-5']);
    });

    it('mengembalikan array kosong [] jika tidak ada tugas yang cocok dengan filter', () => {
      const result = filterAssignments(sampleAssignments, { course: 'Kecerdasan Buatan' });
      assert.deepStrictEqual(result, []);
    });

    it('memastikan array sumber tidak termutasi (immutability)', () => {
      const original = [
        { ...sampleAssignments[0] },
        { ...sampleAssignments[1] }
      ];
      const snapshot = JSON.parse(JSON.stringify(original));

      const result = filterAssignments(original, { status: 'pending' });

      assert.notStrictEqual(result, original);
      assert.deepStrictEqual(original, snapshot);
    });

    it('menangani input assignments bernilai falsy/undefined dengan aman', () => {
      assert.deepStrictEqual(filterAssignments(null), []);
      assert.deepStrictEqual(filterAssignments(undefined), []);
    });
  });

  describe('extractUniqueCourses', () => {
    it('mengembalikan daftar nama mata kuliah unik tanpa duplikasi dalam urutan alfabetis', () => {
      const tasks = [
        { course: 'Struktur Data' },
        { course: 'Algoritma' },
        { course: 'Struktur Data' },
        { course: 'Basis Data' },
        { course: 'Algoritma' }
      ];

      const result = extractUniqueCourses(tasks);
      assert.deepStrictEqual(result, ['Algoritma', 'Basis Data', 'Struktur Data']);
    });

    it('mengembalikan array kosong [] jika input array kosong', () => {
      assert.deepStrictEqual(extractUniqueCourses([]), []);
    });

    it('menangani whitespace pada nama mata kuliah dengan trim() dan mengabaikan course kosong', () => {
      const tasks = [
        { course: '  Fisika Dasar  ' },
        { course: 'Fisika Dasar' },
        { course: '   ' },
        { course: null },
        { course: undefined },
        { course: 'Kimia Dasar' }
      ];

      const result = extractUniqueCourses(tasks);
      assert.deepStrictEqual(result, ['Fisika Dasar', 'Kimia Dasar']);
    });

    it('menangani input assignments bernilai falsy/undefined dengan aman', () => {
      assert.deepStrictEqual(extractUniqueCourses(null), []);
      assert.deepStrictEqual(extractUniqueCourses(undefined), []);
    });
  });
});
