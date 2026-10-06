import { test } from "node:test";
import assert from "node:assert/strict";
import { readSearchState, readSearchPage, searchUrl } from "../src/lib/searchState.ts";

const defaults = () => readSearchState(new URLSearchParams());

test("a shared search restores Unicode titles, every advanced filter, and its page", () => {
    const state = { q: "映画 & Space", type: "tv", person: "A name", role: "director", genre: "18", year: "2025", language: "ja", rating: "7.5", runtime: "45", provider: "8", region: "JP" };
    const url = new URL(searchUrl(state, 3), "https://example.com");
    assert.deepEqual(readSearchState(url.searchParams), state);
    assert.equal(readSearchPage(url.searchParams), 3);
});

test("pagination retains submitted filters and changes only the result page", () => {
    const state = { ...defaults(), q: "Arrival", genre: "878", region: "GB", provider: "8" };
    const first = new URL(searchUrl(state), "https://example.com");
    const later = new URL(searchUrl(state, 5), "https://example.com");
    assert.deepEqual(readSearchState(first.searchParams), readSearchState(later.searchParams));
    assert.equal(readSearchPage(first.searchParams), 1);
    assert.equal(readSearchPage(later.searchParams), 5);
});

test("untrusted title text stays inside a local search query", () => {
    const title = "javascript:alert(1)&page=500#fragment";
    const target = searchUrl({ ...defaults(), q: title });
    assert.ok(target.startsWith("/search?"));
    const params = new URL(target, "https://example.com").searchParams;
    assert.equal(params.get("q"), title);
    assert.equal(params.has("page"), false);
});

test("invalid deep-link enums and numeric bounds cannot reach TMDB filters", () => {
    const state = readSearchState(new URLSearchParams("type=person&region=ZZ&language=evil&year=99999&rating=11&runtime=-1&provider=NaN&genre=Infinity"));
    assert.deepEqual(state, defaults());
    assert.equal(readSearchState(new URLSearchParams("rating=0")).rating, "0");
    const fractionalIds = readSearchState(new URLSearchParams("genre=18.5&provider=8.2&year=2025.3&runtime=45.1"));
    assert.deepEqual(fractionalIds, defaults());
});

test("page links use whole positive pages within TMDB's accessible range", () => {
    for (const [input, expected] of [["-2", 1], ["2.9", 2], ["9999", 500], ["Infinity", 1], ["NaN", 1], ["", 1]]) {
        assert.equal(readSearchPage(new URLSearchParams({ page: input })), expected);
    }
    assert.equal(readSearchPage(new URL(searchUrl(defaults(), Infinity), "https://example.com").searchParams), 1);
});
