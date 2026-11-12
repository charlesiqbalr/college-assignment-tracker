import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  loadAssignments,
  saveAssignments
} from '../../js/storage/storage.js';

/**
 * Helper untuk membuat in-memory mock storageBackend yang kompatibel dengan Storage API.
 * @param {Record<string, string>} [initialData={}]
 * @returns {Storage}
 */
function createMockStorage(initialData = {}) {
  const store = new Map(Object.entries(initialData));

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    }
  };
}

/**
 * Helper untuk membuat mock storageBackend yang melempar QuotaExceededError saat setItem.
 * @returns {Storage}
 */
function createQuotaExceededMockStorage() {
  return {
    getItem() {
      return null;
    },
    setItem() {
      const error = new Error('The quota has been exceeded.');
      error.name = 'QuotaExceededError';
      throw error;
    },
    removeItem() {},
    clear() {}
  };
}

describe('Storage: LocalStorage Persistence and Defensive Fallbacks', () => {
  const sampleAssignments = [
    {
      id: 'uuid-1',
      title: 'Tugas Matematika Diskrit',
      course: 'Matematika',
      dueDate: '2026-11-20T23:59',
      status: 'pending',
      priority: 'high',
      notes: 'Latihan soal graf',
      createdAt: '2026-11-12T10:00:00.000Z'
    },
    {
      id: 'uuid-2',
      title: 'Makalah Etika Profesi',
      course: 'Etika',
      dueDate: '2026-11-15T12:00',
      status: 'completed',
      priority: 'medium',
      notes: '',
      createdAt: '2026-11-12T11:00:00.000Z'
    }
  ];

  describe('Konstanta STORAGE_KEY', () => {
    it('menggunakan kunci penyimpanan "college_assignment_tracker_v1"', () => {
      assert.strictEqual(STORAGE_KEY, 'college_assignment_tracker_v1');
    });
  });

  describe('saveAssignments', () => {
    it('menyimpan array tugas valid ke penyimpanan dengan format JSON yang benar pada STORAGE_KEY dan mengembalikan true', () => {
      const mockStorage = createMockStorage();

      const result = saveAssignments(sampleAssignments, mockStorage);

      assert.strictEqual(result, true);
      const rawStoredValue = mockStorage.getItem(STORAGE_KEY);
      assert.notStrictEqual(rawStoredValue, null);

      const parsed = JSON.parse(rawStoredValue);
      assert.deepStrictEqual(parsed, sampleAssignments);
    });

    it('menangani QuotaExceededError secara anggun dan mengembalikan false tanpa melempar fatal exception', () => {
      const quotaMockStorage = createQuotaExceededMockStorage();

      assert.doesNotThrow(() => {
        const result = saveAssignments(sampleAssignments, quotaMockStorage);
        assert.strictEqual(result, false);
      });
    });

    it('menangani kesalahan tak terduga pada storageBackend secara aman dan mengembalikan false', () => {
      const brokenStorage = {
        setItem() {
          throw new Error('Disk failure or permission denied');
        }
      };

      const result = saveAssignments(sampleAssignments, brokenStorage);
      assert.strictEqual(result, false);
    });
  });

  describe('loadAssignments', () => {
    it('berhasil memuat dan mem-parsing data tugas valid dari penyimpanan', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEY]: JSON.stringify(sampleAssignments)
      });

      const loaded = loadAssignments(mockStorage);

      assert.deepStrictEqual(loaded, sampleAssignments);
      assert.strictEqual(loaded.length, 2);
    });

    it('mengembalikan array kosong [] jika data di penyimpanan bernilai null (belum ada data)', () => {
      const mockStorage = createMockStorage();

      const loaded = loadAssignments(mockStorage);

      assert.deepStrictEqual(loaded, []);
    });

    it('mengembalikan array kosong [] jika data di penyimpanan adalah string kosong atau whitespace', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEY]: '   '
      });

      const loaded = loadAssignments(mockStorage);

      assert.deepStrictEqual(loaded, []);
    });

    it('mengembalikan array kosong [] jika isi penyimpanan bukan JSON valid (string korup)', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEY]: '{invalid-json: corrupted data'
      });

      assert.doesNotThrow(() => {
        const loaded = loadAssignments(mockStorage);
        assert.deepStrictEqual(loaded, []);
      });
    });

    it('mengembalikan array kosong [] jika data JSON bukan bertipe array (misal objek tunggal)', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEY]: JSON.stringify({ id: 'uuid-1', title: 'Bukan Array' })
      });

      const loaded = loadAssignments(mockStorage);

      assert.deepStrictEqual(loaded, []);
    });

    it('mengembalikan array kosong [] jika data JSON adalah tipe primitif (misal integer atau boolean)', () => {
      const mockStorageNumber = createMockStorage({
        [STORAGE_KEY]: '12345'
      });
      assert.deepStrictEqual(loadAssignments(mockStorageNumber), []);

      const mockStorageBoolean = createMockStorage({
        [STORAGE_KEY]: 'true'
      });
      assert.deepStrictEqual(loadAssignments(mockStorageBoolean), []);
    });

    it('menyaring dan membuang elemen array yang tidak memiliki properti esensial atau tidak valid', () => {
      const corruptedData = [
        // Elemen 0: Valid lengkap
        {
          id: 'valid-1',
          title: 'Tugas Valid 1',
          course: 'Pemrograman Web',
          dueDate: '2026-11-30T10:00',
          status: 'pending',
          priority: 'high',
          notes: 'Catatan 1',
          createdAt: '2026-11-12T10:00:00.000Z'
        },
        // Elemen 1: Nilai null
        null,
        // Elemen 2: Tipe primitif string
        'bukan-objek',
        // Elemen 3: Hilang id
        {
          title: 'Hilang ID',
          course: 'Basis Data',
          dueDate: '2026-11-30T10:00',
          status: 'pending'
        },
        // Elemen 4: ID bukan string / string kosong
        {
          id: '',
          title: 'ID Kosong',
          course: 'Basis Data',
          dueDate: '2026-11-30T10:00',
          status: 'pending'
        },
        // Elemen 5: Hilang title / title kosong
        {
          id: 'valid-id-5',
          title: '   ',
          course: 'Basis Data',
          dueDate: '2026-11-30T10:00',
          status: 'pending'
        },
        // Elemen 6: Hilang course / course kosong
        {
          id: 'valid-id-6',
          title: 'Ada Title',
          course: '',
          dueDate: '2026-11-30T10:00',
          status: 'pending'
        },
        // Elemen 7: Hilang dueDate
        {
          id: 'valid-id-7',
          title: 'Ada Title',
          course: 'Basis Data',
          status: 'pending'
        },
        // Elemen 8: status bukan "pending" atau "completed"
        {
          id: 'valid-id-8',
          title: 'Ada Title',
          course: 'Basis Data',
          dueDate: '2026-11-30T10:00',
          status: 'in-progress'
        },
        // Elemen 9: Valid lainnya
        {
          id: 'valid-2',
          title: 'Tugas Valid 2',
          course: 'Kecerdasan Buatan',
          dueDate: '2026-12-01T15:00',
          status: 'completed',
          priority: 'low',
          notes: '',
          createdAt: '2026-11-12T12:00:00.000Z'
        }
      ];

      const mockStorage = createMockStorage({
        [STORAGE_KEY]: JSON.stringify(corruptedData)
      });

      const loaded = loadAssignments(mockStorage);

      // Hanya valid-1 dan valid-2 yang harus lolos
      assert.strictEqual(loaded.length, 2);
      assert.strictEqual(loaded[0].id, 'valid-1');
      assert.strictEqual(loaded[1].id, 'valid-2');
    });

    it('menangani pengecualian saat pemanggilan getItem pada storageBackend secara aman dan mengembalikan []', () => {
      const brokenStorage = {
        getItem() {
          throw new Error('Access denied or storage unavailable');
        }
      };

      assert.doesNotThrow(() => {
        const loaded = loadAssignments(brokenStorage);
        assert.deepStrictEqual(loaded, []);
      });
    });
  });
});
