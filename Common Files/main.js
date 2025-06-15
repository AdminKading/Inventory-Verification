import { getExcelData, clearCookies, extractShopName } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';
import { sendToGoogleDrive } from './driveUploader.js'; // ✅ For sending to Google Drive

window.READ_ONLY = true; // Set this to true for read-only manual quantity

window.onload = () => {
    const mode = window.MODE || 'Inventory';
    const data = getExcelData();

    if (!data) {
        document.getElementById('inventory-container').innerText = 'No data found.';
        return;
    }

    const validRows = filterValidRows(data, mode);
    const container = document.getElementById('inventory-container');
    const tableState = { rows: [] };

    // Pass readOnly flag here:
    const { table, tableRows } = createInventoryTable(validRows, mode, (index, value) => {
        tableRows[index]['MANUAL QUANTITY'] = value;
    }, window.READ_ONLY);

    tableState.rows = tableRows;
    container.appendChild(table);

    const btnDiv = document.createElement('div');
    btnDiv.className = 'button-container';

    const reset = document.createElement('button');
    reset.id = 'reset';
    reset.textContent = 'Reset';
    reset.onclick = () => {
        clearCookies();
        location.reload();
    };

    const send = document.createElement('button');
    send.id = 'send';
    send.textContent = `Send ${mode} Count`;
    send.onclick = () => {
        const shopName = extractShopName(data);

        // ✅ Get the Excel blob and send it to Google Drive
        const blob = exportToExcel(tableState.rows, shopName, mode, true);
        sendToGoogleDrive(blob, `${shopName}_${mode}_Count.xlsx`);
    };

    btnDiv.append(reset, send);
    container.appendChild(btnDiv);
};
