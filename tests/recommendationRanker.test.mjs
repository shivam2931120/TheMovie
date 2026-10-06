import test from 'node:test';
import assert from 'node:assert/strict';
import { rankRecommendations } from '../src/lib/recommendationRanker.ts';

const catalog = [
    { id: 1, title: 'Loved', genres: ['Action'], quality: .8, votes: 100 },
    { id: 2, title: 'Viewed', genres: ['Drama'], quality: .8, votes: 100 },
    { id: 3, title: 'Action A', genres: ['Action'], quality: .9, votes: 500 },
    { id: 4, title: 'Action B', genres: ['Action'], quality: .89, votes: 500 },
    { id: 5, title: 'Drama A', genres: ['Drama'], quality: .88, votes: 500 },
    { id: 6, title: 'Drama B', genres: ['Drama'], quality: .7, votes: 200 },
];
const graph = { 1: [3, 4], 2: [5, 6] };

test('strong ratings outrank weak browsing and seeds never recommend themselves', () => {
    const ranked = rankRecommendations({ seeds: [{ id: 1, weight: 3, source: 'rated' }, { id: 2, weight: .3 }], exploration: 0 }, graph, catalog);
    assert.equal(ranked[0].id, 3);
    assert.match(ranked[0].reason, /rated Loved highly/);
    assert.ok(!ranked.some((entry) => entry.id === 1 || entry.id === 2));
});
test('explicit exclusions and dislikes override positive seeds', () => {
    const ranked = rankRecommendations({ seeds: [{ id: 1, weight: 3 }], negatives: [{ id: 1, weight: 2 }], exclude: [3] }, graph, catalog);
    assert.ok(!ranked.some((entry) => entry.id === 1 || entry.id === 3));
    assert.ok(ranked.every((entry) => !entry.reason.includes('Loved')));
});
test('negative neighbor feedback suppresses otherwise related candidates', () => {
    const before = rankRecommendations({ seeds: [{ id: 1 }], exploration: 0 }, graph, catalog);
    const after = rankRecommendations({ seeds: [{ id: 1 }], negatives: [{ id: 2, weight: 4 }], exploration: 0 }, { ...graph, 2: [3] }, catalog);
    assert.ok(after.find((item) => item.id === 3).score < before.find((item) => item.id === 3).score);
});
test('variety favors a different genre among equally relevant cold-start titles', () => {
    const without = rankRecommendations({ exclude: [1, 2, 6], exploration: 0 }, {}, catalog);
    const withVariety = rankRecommendations({ exclude: [1, 2, 6], exploration: .5 }, {}, catalog);
    assert.deepEqual(without.slice(0, 2).map((item) => item.id), [3, 4]);
    assert.deepEqual(withVariety.slice(0, 2).map((item) => item.id), [3, 5]);
});
test('favorite genres retrieve candidates with no collaborative history', () => {
    const ranked = rankRecommendations({ favoriteGenres: ['Drama'], exclude: [1, 2] }, {}, catalog);
    assert.equal(ranked[0].id, 5);
    assert.match(ranked[0].reason, /interest in Drama/);
});
test('invalid seeds cannot generate invalid IDs or nonfinite scores', () => {
    const ranked = rankRecommendations({ seeds: [{ id: -1 }, { id: Infinity }, { id: 1, weight: NaN }], exploration: Infinity }, graph, catalog);
    assert.ok(ranked.length > 0);
    assert.ok(ranked.every((entry) => Number.isFinite(entry.score) && entry.id > 0));
    assert.deepEqual(ranked, rankRecommendations({ seeds: [{ id: -1 }, { id: Infinity }, { id: 1, weight: NaN }], exploration: Infinity }, graph, catalog));
});
test('unknown titles fall back to catalog recommendations', () => {
    const ranked = rankRecommendations({ seeds: [{ id: 9999999 }] }, graph, catalog);
    assert.ok(ranked.length > 0);
    assert.equal(ranked[0].reason, 'Popular among movie viewers');
});
test('TMDB Family and MovieLens Children genres match', () => {
    const ranked = rankRecommendations({ favoriteGenres: ['Family'] }, {}, [
        { id: 10, title: 'Children film', genres: ['Children'], quality: .5 },
        { id: 11, title: 'Drama', genres: ['Drama'], quality: .9 },
    ]);
    assert.equal(ranked[0].id, 10);
});
test('untrusted explanation labels are bounded', () => {
    const ranked = rankRecommendations({ seeds: [{ id: 1, label: 'x'.repeat(10000) }] }, graph, catalog);
    assert.ok(ranked.every((item) => item.reason.length < 250));
});
