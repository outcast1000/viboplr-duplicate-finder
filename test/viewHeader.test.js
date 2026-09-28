"use strict";
// The host-drawn view header (api.ui.setViewHeader, host >= 1.0.77): the pure
// viewHeaderFor, and how activate() uses it — pushed only when it changes, and
// replacing the pinned toolbar only on hosts that have it.
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const code = fs.readFileSync(path.join(__dirname, "..", "index.js"), "utf8");
function load() {
  // eslint-disable-next-line no-new-func
  return new Function("api", code)({});
}
const viewHeaderFor = load()._viewHeaderFor;

const base = { loading: false, scanned: false, error: "", groups: 0, extras: 0, reclaimable: 0 };

test("not scanned: invites a scan, no status", () => {
  const h = viewHeaderFor(base);
  assert.strictEqual(h.subtitle, "Not scanned yet");
  assert.strictEqual(h.status, null);
  assert.deepStrictEqual(h.actions, [{ label: "Scan library", action: "rescan", variant: "accent", disabled: false }]);
});

test("scanning: muted status and a disabled button", () => {
  const h = viewHeaderFor({ ...base, loading: true, scanned: true, groups: 3 });
  assert.deepStrictEqual(h.status, { variant: "muted", label: "Scanning…" });
  assert.strictEqual(h.actions[0].label, "Scanning…");
  assert.strictEqual(h.actions[0].disabled, true);
});

test("error: error status, message as subtitle, rescan offered", () => {
  const h = viewHeaderFor({ ...base, scanned: true, error: "Scan failed: boom" });
  assert.deepStrictEqual(h.status, { variant: "error", label: "Scan failed" });
  assert.strictEqual(h.subtitle, "Scan failed: boom");
  assert.strictEqual(h.actions[0].label, "Rescan");
});

test("clean library: success status", () => {
  const h = viewHeaderFor({ ...base, scanned: true });
  assert.strictEqual(h.subtitle, "No duplicates found");
  assert.deepStrictEqual(h.status, { variant: "success", label: "Clean" });
});

test("duplicates found: summary subtitle with plurals", () => {
  const many = viewHeaderFor({ ...base, scanned: true, groups: 14, extras: 31, reclaimable: 250 * 1024 * 1024 });
  assert.strictEqual(many.subtitle, "14 duplicate groups · 31 extra copies · 250 MB reclaimable");
  assert.strictEqual(many.status, null);
  const one = viewHeaderFor({ ...base, scanned: true, groups: 1, extras: 1, reclaimable: 2048 });
  assert.strictEqual(one.subtitle, "1 duplicate group · 1 extra copy · 2 KB reclaimable");
});

test("header fits the host limits", () => {
  const h = viewHeaderFor({ ...base, scanned: true, groups: 99999, extras: 999999, reclaimable: 9e15 });
  assert.ok(h.subtitle.length <= 160);
  assert.ok(h.actions.length <= 2);
  for (const a of h.actions) assert.ok(a.label.length <= 24);
});

function mockApi(withHeader) {
  const calls = { headers: [], views: [] };
  const handlers = {};
  const api = {
    ui: {
      setViewData: (id, data) => calls.views.push(data),
      onAction: (name, fn) => { handlers[name] = fn; },
      requestAction: () => {},
    },
    library: {
      findDuplicates: () => Promise.resolve([]),
      onTrackRemoved: () => {}, onTrackAdded: () => {}, onScanComplete: () => {},
    },
    playback: { playTracks: () => {} },
    storage: { get: () => Promise.resolve(null), set: () => Promise.resolve() },
  };
  if (withHeader) api.ui.setViewHeader = (id, h) => calls.headers.push([id, h]);
  return { api, calls, handlers };
}
const flush = () => new Promise((r) => setImmediate(r));

test("with setViewHeader: pushes on activate, only on change, and drops the toolbar", async () => {
  const { api, calls, handlers } = mockApi(true);
  load().activate(api);
  await flush();
  assert.strictEqual(calls.headers.length, 1);
  assert.strictEqual(calls.headers[0][0], "duplicate-finder");
  assert.strictEqual(calls.headers[0][1].subtitle, "Not scanned yet");
  const top = calls.views[calls.views.length - 1].children;
  assert.ok(!top.some((n) => n.type === "toolbar"), "no self-drawn toolbar");

  handlers["toggle-size"]({ value: true }); // re-renders, header unchanged
  assert.strictEqual(calls.headers.length, 1, "unchanged header not re-sent");

  handlers.rescan();
  await flush();
  const subtitles = calls.headers.map((c) => c[1].subtitle);
  assert.deepStrictEqual(subtitles.slice(1), ["Scanning your library for duplicate songs", "No duplicates found"]);
});

test("older host (no setViewHeader): keeps the toolbar", async () => {
  const { api, calls } = mockApi(false);
  load().activate(api);
  await flush();
  const top = calls.views[calls.views.length - 1].children;
  assert.strictEqual(top[0].type, "toolbar");
  assert.strictEqual(top[0].title, "Duplicate Finder");
});
