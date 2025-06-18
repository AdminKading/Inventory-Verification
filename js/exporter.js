export function exportToExcel(rows, shopName, mode, returnBlob = false) {
  const date = new Date().toLocaleDateString().replace(/\//g, '-');
  const headers = Object.keys(rows[0]);

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

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

  const colWidths = headers.map(header => {
    if (header === 'Name') {
      // Make Name column wider, e.g., 40 characters wide
      return { wch: 30 };
    }
    if (header === 'Quantity On Hand' || header === 'Manual Quantity') {
      // Make these quantity columns narrower, e.g., 10 characters wide
      return { wch: 10 };
    }

    // For other columns, auto-calc max length
    let maxLength = header.length;
    rows.forEach(row => {
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
