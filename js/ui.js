import { getCookie, setCookie } from './data.js';

export function createInventoryTable(rows, onManualUpdate = null, readOnly = false, cookiePrefix = '') {
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
    const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"];
    const name = nameRaw.toString().trim();
    const qty = (qtyRaw === undefined || qtyRaw === '') ? 0 : parseFloat(qtyRaw) || 0;

    let manualValue = 0;
    if (readOnly) {
      const raw = row["MANUAL QUANTITY"];
      manualValue = raw === undefined || raw === '' || isNaN(raw) ? 0 : parseFloat(raw);
    } else {
      // Read cookie here to initialize input
      const cookieVal = getCookie(cookiePrefix + name);
      manualValue = cookieVal === undefined || cookieVal === '' || isNaN(cookieVal)
        ? 0
        : parseFloat(cookieVal);
    }

    const manualTd = document.createElement('td');
    manualTd.style.padding = '10px';

    if (readOnly) {
      manualTd.textContent = manualValue;
      manualTd.style.textAlign = 'center';
    } else {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = manualValue;
      input.id = `manual-${index}`;

      // Set cookie on user input change here only, expires in 2 hours
      input.addEventListener('input', (e) => {
        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
        setCookie(cookiePrefix + name, value, 2); // 2 hours expiry
        onManualUpdate?.(index, value);
      });

      manualTd.appendChild(input);
    }

    const nameTd = document.createElement('td');
    nameTd.textContent = name;
    nameTd.style.padding = '10px';

    const qtyTd = document.createElement('td');
    qtyTd.textContent = qty;
    qtyTd.style.padding = '10px';
    qtyTd.style.textAlign = 'center';

    tr.appendChild(nameTd);
    tr.appendChild(qtyTd);
    tr.appendChild(manualTd);
    table.appendChild(tr);

    tableRows.push({
      NAME: name,
      'QUANTITY ON HAND': qty,
      'MANUAL QUANTITY': manualValue
    });
  });

  return { table, tableRows };
}
