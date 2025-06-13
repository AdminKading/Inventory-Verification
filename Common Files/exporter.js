export function exportToExcel(rows, shopName, mode) {
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const headers = Object.keys(rows[0]);

    // 🛠️ Fallback: Try to extract shopName from the data if it's missing or set to Unknown_Shop
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

    // ✅ Build worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, mode);

    // ✅ Create blob for download
    const blob = new Blob([XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
    })], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // ✅ Trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${shopName}_${mode}_Count_${date}.xlsx`;
    a.click();
}
