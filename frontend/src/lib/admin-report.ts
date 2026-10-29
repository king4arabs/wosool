/** Quote every cell and neutralize spreadsheet formulas in exported values. */
export function reportCsv(rows: Array<Array<string | number | null>>) {
  return '\uFEFF' + rows.map(row => row.map(value => {
    let text = value === null ? '' : String(value)
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
    return '"' + text.replaceAll('"', '""') + '"'
  }).join(',')).join('\r\n')
}
export function periodChange(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null
  return current - previous
}
