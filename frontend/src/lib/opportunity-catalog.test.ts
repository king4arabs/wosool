import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  opportunityCatalog,
  arrangeOpportunities,
  opportunityGroups,
} from "./opportunity-catalog";
test("catalog has short bilingual titles, unique slugs and HTTPS sources", () => {
  assert.equal(
    new Set(opportunityCatalog.map((r) => r.slug)).size,
    opportunityCatalog.length,
  );
  for (const row of opportunityCatalog) {
    assert.ok(row.title_ar.trim().split(/\s+/).length <= 4, row.slug);
    assert.ok(row.title_en.trim().split(/\s+/).length <= 4, row.slug);
    assert.equal(new URL(row.source_url).protocol, "https:");
    assert.ok(row.eligibility_ar);
  }
});
test("shuffle keeps investment before connections before perks, preserving every entry", () => {
  const arranged = arrangeOpportunities(opportunityCatalog, () => 0);
  assert.equal(arranged.length, opportunityCatalog.length);
  assert.deepEqual(
    new Set(arranged.map((r) => r.slug)),
    new Set(opportunityCatalog.map((r) => r.slug)),
  );
  const ranks = arranged.map((row) =>
    opportunityGroups.indexOf(row.group as (typeof opportunityGroups)[number]),
  );
  assert.deepEqual(
    ranks,
    [...ranks].sort((a, b) => a - b),
  );
  assert.notDeepEqual(
    arranged.map((r) => r.slug),
    opportunityCatalog.map((r) => r.slug),
  );
});
test("frontend and independently deployed API have identical opportunity destinations", () => {
  assert.deepEqual(
    JSON.parse(
      readFileSync(
        new URL(
          "../../../backend/resources/data/opportunities.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ),
    opportunityCatalog,
  );
});
