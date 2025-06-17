import { getCookie, setCookie } from './data.js';

export function createInventoryTable(rows, onManualUpdate = null, readOnly = false) {
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

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');

    const nameRaw = row["__EMPTY"] ?? row["NAME"] ?? '';
    const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"] ?? '';
    const name = nameRaw.toString().trim();
    const qty = parseInt(qtyRaw, 10) || '';

    const manualValue = readOnly
      ? (row["MANUAL QUANTITY"] ?? '').toString().trim()
      : getCookie(name) ?? '';

    const manualDisplay = readOnly
      ? manualValue
      : (() => {
          const input = document.createElement('input');
          input.type = 'number';
          input.value = manualValue;
          input.addEventListener('input', (e) => {
            const value = e.target.value === '' ? null : parseFloat(e.target.value);
            setCookie(name, value, 7);
            onManualUpdate?.(index, value);
          });
          return input;
        })();

    [name, qty, manualDisplay].forEach(val => {
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

    tableRows.push({
      NAME: name,
      'QUANTITY ON HAND': qty,
      'MANUAL QUANTITY': manualValue === '' ? null : parseFloat(manualValue),
    });
  });

  return { table, tableRows };
}
