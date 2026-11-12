import test from 'node:test';
import assert from 'node:assert/strict';

test('smoke test: node test runner and assert/strict are operational', () => {
  assert.equal(1 + 1, 2);
  assert.strictEqual(true, true);
});

test('smoke test: ES module imports work as expected', () => {
  assert.ok(typeof test === 'function');
  assert.ok(typeof assert.strictEqual === 'function');
});
