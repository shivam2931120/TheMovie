import { test } from "node:test";
import assert from "node:assert/strict";
import { reorderListEntry, transferListEntries } from "../src/lib/listManagement.js";

const movie = { id: 42, title: "A movie", type: "movie" };
const tv = { id: 42, title: "A show", type: "tv" };
const other = { id: 99, title: "Keep me", type: "movie" };
const data = () => [{ id: "source", movies: [movie, tv, other] }, { id: "target", movies: [movie] }];

test("bulk copy deduplicates existing movies while retaining a show with the same numeric ID", () => {
    const lists = data();
    const next = transferListEntries(lists, "source", "target", ["movie:42", "tv:42"]);
    assert.deepEqual(next[1].movies, [movie, tv]);
    assert.deepEqual(next[0].movies, [movie, tv, other]);
    assert.deepEqual(lists, data());
});

test("bulk move removes only selected typed entries, including an entry already at the destination", () => {
    const next = transferListEntries(data(), "source", "target", ["movie:42", "tv:42"], true);
    assert.deepEqual(next[0].movies, [other]);
    assert.deepEqual(next[1].movies, [movie, tv]);
});

test("a missing or same destination never deletes the source", () => {
    const lists = data();
    assert.equal(transferListEntries(lists, "source", "gone", ["movie:42"], true), lists);
    assert.equal(transferListEntries(lists, "source", "source", ["movie:42"], true), lists);
});

test("reordering preserves all entries and ignores stale selections and out-of-bounds moves", () => {
    const lists = data();
    assert.deepEqual(reorderListEntry(lists, "source", "tv:42", -1)[0].movies, [tv, movie, other]);
    assert.deepEqual(reorderListEntry(lists, "source", "movie:42", -1), lists);
    assert.deepEqual(reorderListEntry(lists, "source", "movie:111", 1), lists);
    assert.deepEqual(lists, data());
});
