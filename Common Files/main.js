import { getExcelData, clearCookies } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';
import { sendEmail } from './emailSender.js'; // ✅ NEW IMPORT

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

    const { table, tableRows } = createInventoryTable(validRows, mode, (index, value) => {
        tableRows[index]['MANUAL QUANTITY'] = value;
    });

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
        const shopName = data.find(row => row['Inventory By Shop'])?.['Inventory By Shop'].split(':')[1].trim().replace(/\s+/g, '_') || 'Unknown_Shop';
        exportToExcel(tableState.rows, shopName, mode);

        setTimeout(() => {
            sendEmail(shopName, mode); // ✅ CLEAN CALL
        }, 800);
    };

    btnDiv.append(reset, send);
    container.appendChild(btnDiv);
};
