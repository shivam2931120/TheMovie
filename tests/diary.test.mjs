import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidDiaryDate, mergeDiary, diaryStats, normalizeDiary } from '../src/lib/diary.ts';
import { nextFeatureTimestamp } from '../src/lib/featureSnapshot.ts';

test('diary rejects impossible and future dates while accepting leap days', () => {
    assert.equal(isValidDiaryDate('2024-02-29', '2024-03-01'), true);
    assert.equal(isValidDiaryDate('2023-02-29', '2024-03-01'), false);
    assert.equal(isValidDiaryDate('2024-03-02', '2024-03-01'), false);
    assert.equal(isValidDiaryDate('2024-2-1', '2024-03-01'), false);
});
const entry = (id, type = 'movie', updatedAt = '2024-01-01') => ({ id, item: { id: 7, type, title: 'Title', runtime: 100 }, watchedOn: '2024-01-01', updatedAt, createdAt: updatedAt, rating: 8, notes: '' });
test('guest merge preserves rewatches and chooses the latest revision of an entry', () => {
    const original = entry('a');
    const updated = { ...entry('a', 'movie', '2024-01-02'), notes: 'Edited' };
    const merged = mergeDiary([original], [updated, entry('b')]);
    assert.equal(merged.length, 2);
    assert.equal(merged.find((item) => item.id === 'a').notes, 'Edited');
    assert.equal(original.notes, '');
});
test('rewatch counts distinguish movies and TV with matching numeric IDs', () => {
    assert.deepEqual(diaryStats([entry('a'), entry('b'), entry('c', 'tv')]), { entries: 3, unique: 2, rewatches: 1, minutes: 300 });
});
test('monthly statistics count a rewatch whose first viewing was last month', () => {
    const first = entry('a');
    const rewatch = { ...entry('b'), watchedOn: '2024-02-01' };
    assert.equal(diaryStats([rewatch], [first, rewatch]).rewatches, 1);
});
test('malformed saved diary data is rejected or normalized safely', () => {
    assert.deepEqual(normalizeDiary(null), []);
    const entries = normalizeDiary([null, {}, { ...entry('a'), notes: 42, rating: 99 }, { ...entry('b'), watchedOn: '2024-02-30' }]);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].rating, 10);
    assert.equal(entries[0].notes, '');
});
test('snapshot revisions advance for simultaneous edits and backward device clocks', () => {
    const now = Date.parse('2024-01-01T00:00:00Z');
    const first = nextFeatureTimestamp('', now);
    const second = nextFeatureTimestamp(first, now);
    const third = nextFeatureTimestamp(second, now - 1000);
    assert.ok(first < second && second < third);
});
