export function exportToExcel(rows, shopName, mode, returnBlob = false, columns = null) {
  const date = new Date().toLocaleDateString().replace(/\//g, '-');

  // Use columns param if provided, else fallback to keys of first row
  const headers = columns ?? Object.keys(rows[0]);

  if (!shopName || shopName === 'Unknown_Shop') {
    const shopRow = rows.find(row => row['Inventory By Shop']);
    if (shopRow) {
      const raw = shopRow['Inventory By Shop'];
      if (typeof raw === 'string' && raw.includes(':')) {
        shopName = raw.split(':')[1].trim().replace(/\s+/g, '_');
      }
    }
    if (!shopName) shopName = 'Unknown_Shop';
  }

  // Filter rows to only include keys in headers
  const filteredRows = rows.map(row => {
    const filtered = {};
    headers.forEach(h => {
      filtered[h] = row[h];
    });
    return filtered;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredRows, { header: headers });

  const colWidths = headers.map(header => {
    if (header.toLowerCase() === 'name') {
      return { wch: 30 };
    }
    if (header.toLowerCase() === 'quantity on hand' || header.toLowerCase() === 'manual quantity') {
      return { wch: 10 };
    }

    let maxLength = header.length;
    filteredRows.forEach(row => {
      const val = row[header];
      if (val != null) {
        const length = val.toString().length;
        if (length > maxLength) maxLength = length;
      }
    });
    return { wch: maxLength + 2 };
  });

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, mode);

  const blob = new Blob([XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  })], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  if (returnBlob) return blob;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${shopName}_${mode}_Count_${date}.xlsx`;
  a.click();
}
