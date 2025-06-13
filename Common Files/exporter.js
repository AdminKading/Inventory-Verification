export function exportToExcel(rows, shopName, mode) {
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const headers = Object.keys(rows[0]);

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

    // ✅ Create workbook once
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, mode);

    // ✅ Write using that same workbook
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
