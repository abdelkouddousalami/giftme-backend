function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`
  }
  return str
}

/** Builds a CSV string and triggers a browser download - the "download report" feature. */
export function downloadCsv(filename, rows, columns) {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',')
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(c.accessor(row))).join(','))
  const csv = [header, ...lines].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
