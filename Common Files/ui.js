import { getCookie, setCookie } from './data.js';

export function createInventoryTable(validRows, onManualUpdate) {
    const table = document.createElement('table');
    table.border = '1';
    const headerRow = document.createElement('tr');

    ['NAME', 'QUANTITY ON HAND', 'MANUAL QUANTITY'].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    const tableRows = [];

    validRows.forEach((row, index) => {
        const tr = document.createElement('tr');
        const name = row["__EMPTY"].trim();
        const qty = parseInt(row["__EMPTY_9"], 10);
        const cookieVal = getCookie(name);

        const manualInput = document.createElement('input');
        manualInput.type = 'number';
        manualInput.value = cookieVal ?? '';
        manualInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || null;
            setCookie(name, value, 7);
            onManualUpdate(index, value);
        });

        [name, qty, manualInput].forEach(val => {
            const td = document.createElement('td');
            td.style.padding = '10px';
            if (val instanceof HTMLElement) {
                td.appendChild(val);
            } else {
                td.textContent = val;
                td.style.textAlign = 'center';
            }
            tr.appendChild(td);
        });

        table.appendChild(tr);

        tableRows.push({ NAME: name, 'QUANTITY ON HAND': qty, 'MANUAL QUANTITY': cookieVal ? parseFloat(cookieVal) : null });
    });

    return { table, tableRows };
}
