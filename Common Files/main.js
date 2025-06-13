import { getExcelData, clearCookies } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';

window.onload = () => {
    const mode = window.MODE || 'Inventory'; // Default to Inventory

    const data = getExcelData();
    if (!data) {
        document.getElementById('inventory-container').innerText = 'No data found.';
        return;
    }

    const validRows = filterValidRows(data, mode);  // Pass mode into logic
    const container = document.getElementById('inventory-container');
    const tableState = { rows: [] };

    const { table, tableRows } = createInventoryTable(validRows, mode, (index, value) => {
        tableRows[index]['MANUAL QUANTITY'] = value;
    });

    tableState.rows = tableRows;
    container.appendChild(table);

    const btnDiv = document.createElement('div');
    const reset = document.createElement('button');
    reset.textContent = 'Reset';
    reset.onclick = () => {
        clearCookies();
        location.reload();
    };

    const send = document.createElement('button');
    send.textContent = `Send ${mode} Count`;
    send.onclick = () => {
        const shopName = data.find(row => row['Inventory By Shop'])?.['Inventory By Shop'].split(':')[1].trim().replace(/\s+/g, '_') || 'Unknown_Shop';
        exportToExcel(tableState.rows, shopName, mode);

        setTimeout(() => {
            const emails = 'tyler@kadingproperties.com,michael@kadingproperties.com';
            const date = new Date().toLocaleDateString().replace(/\//g, '-');
            const subject = `${shopName} | ${mode} Count | ${date}`;
            const body = `Hello,\n\nAttached is the ${mode.toLowerCase()} count file for ${shopName.replace(/_/g, ' ')}.\n\nBest,\nInventory Verification App`;

            const mailto = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
        }, 1000);
    };

    btnDiv.append(reset, send);
    container.appendChild(btnDiv);
};
