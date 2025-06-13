import { getExcelData, clearCookies } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';

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
    btnDiv.style.marginTop = '20px';
    btnDiv.style.display = 'flex';
    btnDiv.style.gap = '10px';

    const reset = document.createElement('button');
    reset.textContent = 'Reset';
    reset.style.padding = '10px 15px';
    reset.style.fontSize = '16px';
    reset.style.borderRadius = '5px';
    reset.onclick = () => {
        clearCookies();
        location.reload();
    };

    const send = document.createElement('button');
    send.textContent = `Send ${mode} Count`;
    send.style.backgroundColor = 'green';
    send.style.color = 'white';
    send.style.padding = '10px 15px';
    send.style.fontSize = '16px';
    send.style.border = 'none';
    send.style.borderRadius = '5px';
    send.onclick = () => {
        const shopName = data.find(row => row['Inventory By Shop'])?.['Inventory By Shop'].split(':')[1].trim().replace(/\s+/g, '_') || 'Unknown_Shop';
        exportToExcel(tableState.rows, shopName, mode);

        setTimeout(() => {
            const emails = 'tyler@kadingproperties.com,michael@kadingproperties.com';
            const date = new Date().toLocaleDateString().replace(/\//g, '-');
            const subject = `${shopName} | ${mode} Count | ${date}`;
            const body = `
Hello,

Attached is the ${mode.toLowerCase()} count file for ${shopName.replace(/_/g, ' ')}. This file was generated on ${date}.
Please find the Excel document attached.

Note: This is an automatic email sent from Inventory Verification.
Visit: https://adminkading.github.io/Inventory-Verification/

Best regards,
${shopName.replace(/_/g, ' ')}
            `.trim();

            const mailto = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;

            alert('Email prepared. Please attach the downloaded Excel file before sending.');
        }, 800);
    };

    btnDiv.append(reset, send);
    container.appendChild(btnDiv);
};
