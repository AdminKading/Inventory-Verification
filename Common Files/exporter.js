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
