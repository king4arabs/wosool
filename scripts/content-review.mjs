import { loadContentReport } from './lib/content-review.mjs'

try {
  const report = await loadContentReport()
  if (process.argv.includes('--check')) {
    for (const problem of report.problems) console.error(problem)
    const { founders, companies, news } = report.totals
    console.log(`${founders} founders, ${companies} companies, ${news} stories; ${report.problems.length} integrity problems; ${report.reviews_due.length} founder reviews due.`)
  } else {
    console.log(JSON.stringify(report, null, 2))
  }
  process.exitCode = report.problems.length ? 1 : 0
} catch (error) {
  console.error(`Content review failed: ${error.message}`)
  process.exitCode = 1
}
