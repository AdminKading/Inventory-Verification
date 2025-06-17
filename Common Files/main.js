import { getExcelData, clearCookies, extractShopName } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';
import { sendToGoogleDrive } from './driveUploader.js'; // ✅ For sending to Google Drive

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

    const { table, tableRows } = createInventoryTable(validRows, (index, value) => {
        tableRows[index]['MANUAL QUANTITY'] = value;
    }, false);

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

        // Generate the Excel blob for the current data
        const blob = exportToExcel(tableState.rows, shopName, mode, true);

        // Send blob to Google Drive with separate shopName and mode params (filename will be generated server-side)
        sendToGoogleDrive(blob, shopName, mode);
    };

    btnDiv.append(reset, send);
    container.appendChild(btnDiv);
};
