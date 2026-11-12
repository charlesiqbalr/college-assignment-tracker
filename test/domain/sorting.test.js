import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sortAssignments } from '../../js/domain/sorting.js';

describe('Domain: Sorting Logic (sortAssignments)', () => {
  const sampleAssignments = [
    {
      id: 'task-1',
      title: 'Tugas Kalkulus',
      course: 'Matematika',
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
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'task-4',
      title: 'Laporan Praktikum Fisika Lama',
      course: 'Fisika Dasar',
      dueDate: '2026-11-01T08:00',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'task-5',
      title: 'Laporan Praktikum Fisika Baru',
      course: 'Fisika Dasar',
      dueDate: '2026-11-10T12:00',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'task-6',
      title: 'Review Jurnal AI',
      course: 'Kecerdasan Buatan',
      dueDate: '2026-11-18T09:00',
      status: 'pending',
      priority: 'medium'
    }
  ];

  describe('Pengurutan default / dueDate', () => {
    it('mengurutkan tugas pending dari tenggat terdekat ke terlama (ascending)', () => {
      const pendingTasks = [
        sampleAssignments[0], // 2026-11-20
        sampleAssignments[1], // 2026-11-15
        sampleAssignments[2], // 2026-11-18 14:00
        sampleAssignments[5]  // 2026-11-18 09:00
      ];

      const result = sortAssignments(pendingTasks, 'dueDate');
      const resultIds = result.map(t => t.id);

      assert.deepStrictEqual(resultIds, ['task-2', 'task-6', 'task-3', 'task-1']);
    });

    it('menempatkan seluruh tugas pending di atas seluruh tugas completed', () => {
      const mixedTasks = [
        sampleAssignments[4], // completed (2026-11-10)
        sampleAssignments[0], // pending (2026-11-20)
        sampleAssignments[3], // completed (2026-11-01)
        sampleAssignments[1]  // pending (2026-11-15)
      ];

      const result = sortAssignments(mixedTasks, 'dueDate');

      // 2 pertama harus pending, 2 terakhir harus completed
      assert.strictEqual(result[0].status, 'pending');
      assert.strictEqual(result[1].status, 'pending');
      assert.strictEqual(result[2].status, 'completed');
      assert.strictEqual(result[3].status, 'completed');

      // Memastikan urutan pending sesuai dueDate ascending
      assert.strictEqual(result[0].id, 'task-2');
      assert.strictEqual(result[1].id, 'task-1');
    });

    it('mengurutkan sesama tugas completed dari tenggat terbaru ke terlama (descending)', () => {
      const completedTasks = [
        sampleAssignments[3], // 2026-11-01
        sampleAssignments[4]  // 2026-11-10
      ];

      const result = sortAssignments(completedTasks, 'dueDate');
      const resultIds = result.map(t => t.id);

      // task-5 (10 Nov) lebih baru dari task-4 (1 Nov)
      assert.deepStrictEqual(resultIds, ['task-5', 'task-4']);
    });

    it('menggunakan opsi "dueDate" sebagai default jika sortOption tidak diberikan', () => {
      const mixedTasks = [
        sampleAssignments[4], // completed
        sampleAssignments[0], // pending 2026-11-20
        sampleAssignments[1]  // pending 2026-11-15
      ];

      const resultExplicit = sortAssignments(mixedTasks, 'dueDate');
      const resultDefault = sortAssignments(mixedTasks);

      assert.deepStrictEqual(resultDefault, resultExplicit);
    });
  });

  describe('Pengurutan priority', () => {
    it('mengurutkan tugas pending dari prioritas high -> medium -> low', () => {
      const pendingTasks = [
        sampleAssignments[0], // low
        sampleAssignments[5], // medium
        sampleAssignments[1]  // high
      ];

      const result = sortAssignments(pendingTasks, 'priority');
      const resultPriorities = result.map(t => t.priority);

      assert.deepStrictEqual(resultPriorities, ['high', 'medium', 'low']);
      assert.deepStrictEqual(result.map(t => t.id), ['task-2', 'task-6', 'task-1']);
    });

    it('menerapkan tie-breaker dueDate terdekat jika terdapat tugas pending dengan prioritas sama', () => {
      // task-1 (high, 2026-11-15) dan task-2 (high, 2026-11-18 14:00)
      const samePriorityTasks = [
        sampleAssignments[2], // high, 2026-11-18 14:00
        sampleAssignments[1]  // high, 2026-11-15 23:59
      ];

      const result = sortAssignments(samePriorityTasks, 'priority');
      const resultIds = result.map(t => t.id);

      assert.deepStrictEqual(resultIds, ['task-2', 'task-3']);
    });

    it('menempatkan seluruh tugas completed di bawah seluruh tugas pending pada mode priority', () => {
      const mixedTasks = [
        sampleAssignments[3], // completed, high
        sampleAssignments[0], // pending, low
        sampleAssignments[1], // pending, high
        sampleAssignments[4]  // completed, medium
      ];

      const result = sortAssignments(mixedTasks, 'priority');

      assert.strictEqual(result[0].status, 'pending');
      assert.strictEqual(result[0].id, 'task-2'); // high
      assert.strictEqual(result[1].status, 'pending');
      assert.strictEqual(result[1].id, 'task-1'); // low
      assert.strictEqual(result[2].status, 'completed');
      assert.strictEqual(result[3].status, 'completed');
    });
  });

  describe('Kasus batas & immutability', () => {
    it('mengembalikan array kosong baru saat input array kosong []', () => {
      const empty = [];
      const result = sortAssignments(empty, 'dueDate');

      assert.deepStrictEqual(result, []);
      assert.notStrictEqual(result, empty);
    });

    it('mengembalikan array baru dengan elemen yang sama saat input 1 elemen', () => {
      const single = [sampleAssignments[0]];
      const result = sortAssignments(single, 'dueDate');

      assert.deepStrictEqual(result, [sampleAssignments[0]]);
      assert.notStrictEqual(result, single);
    });

    it('memastikan array sumber tidak termutasi setelah pemanggilan fungsi (immutability)', () => {
      const original = [
        { ...sampleAssignments[0] },
        { ...sampleAssignments[1] },
        { ...sampleAssignments[3] }
      ];
      const snapshot = JSON.parse(JSON.stringify(original));

      const result = sortAssignments(original, 'dueDate');

      assert.notStrictEqual(result, original);
      assert.deepStrictEqual(original, snapshot);
    });

    it('menangani input assignments bernilai falsy/undefined dengan mengembalikan []', () => {
      assert.deepStrictEqual(sortAssignments(null), []);
      assert.deepStrictEqual(sortAssignments(undefined), []);
    });
  });
});
