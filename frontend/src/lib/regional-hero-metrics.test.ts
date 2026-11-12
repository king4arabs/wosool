import assert from "node:assert/strict"
import { test } from "node:test"
import { regionalHeroValues } from "./regional-hero-metrics"

test("all four regions have four finite, populated hero metrics", () => {
  assert.equal(regionalHeroValues.length, 4)
  for (const [region, metrics] of regionalHeroValues.entries()) {
    assert.equal(metrics.length, 4, `region ${region} must have four cards`)
    metrics.forEach((value, index) => {
      assert.ok(Number.isFinite(value), `region ${region}, metric ${index} must be a number`)
    })
    assert.ok(metrics[0] > 0, `region ${region} must have a sourced founder/ecosystem count`)
    assert.ok(metrics[1] > 0, `region ${region} must have a sourced company count`)
  }
})

test("MENA sales and global ecosystem figures remain populated", () => {
  assert.equal(regionalHeroValues[2][2], 12.2)
  assert.equal(regionalHeroValues[3][0], 350)
})
