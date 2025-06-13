export function exportToExcel(rows, shopName, mode) {
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const headers = Object.keys(rows[0]);

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), worksheet, mode);

    const blob = new Blob([XLSX.write(XLSX.utils.book_new(), {
        bookType: 'xlsx',
        type: 'array'
    })], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${shopName}_${mode}_Count_${date}.xlsx`;
    a.click();
}
