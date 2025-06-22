import { getCookie, setCookie } from './data.js';

export function createInventoryTable(
  rows,
  onManualUpdate = null,
  readOnly = false,
  cookiePrefix = '',
  showQtyOnHand = true,
  showExtras = true  // NEW param to control extra columns
) {
  // Remove isInventoryMode since we use showExtras now
  // const isInventoryMode = cookiePrefix.startsWith('InventoryCount_');

  const table = document.createElement('table');
  table.border = '1';

  // Define headers based on showQtyOnHand and showExtras
  const headerRow = document.createElement('tr');
  const headers = ['NAME'];
  if (showQtyOnHand) headers.push('QUANTITY ON HAND');
  headers.push('MANUAL QUANTITY');
  if (showExtras) headers.push('COST', 'DIFFERENCE', 'TOTAL VALUE DIFFERENCE');

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.padding = '10px';
    th.style.textAlign = 'center';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const tableRows = [];
  let totalValueDifference = 0;

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const nameRaw = row["__EMPTY"] ?? row["NAME"] ?? '';
    const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"];
    const costRaw = row["__EMPTY_3"] ?? row["COST"];

    const name = nameRaw.toString().trim();
    const qty = (qtyRaw === undefined || qtyRaw === '') ? 0 : parseFloat(qtyRaw) || 0;
    const cost = (costRaw === undefined || costRaw === '') ? 0 : parseFloat(costRaw) || 0;

    let manualValue = 0;
    if (readOnly) {
      const raw = row["MANUAL QUANTITY"];
      manualValue = raw === undefined || raw === '' || isNaN(raw) ? 0 : parseFloat(raw);
    } else {
      const cookieVal = getCookie(cookiePrefix + name);
      manualValue = cookieVal === undefined || cookieVal === '' || isNaN(cookieVal)
        ? 0
        : parseFloat(cookieVal);
    }

    const difference = manualValue - qty;
    const totalValueDiff = difference * cost;
    totalValueDifference += totalValueDiff;

    // NAME cell (always shown)
    const nameTd = document.createElement('td');
    nameTd.textContent = name;
    nameTd.style.padding = '10px';
    tr.appendChild(nameTd);

    // QUANTITY ON HAND cell (conditionally shown)
    if (showQtyOnHand) {
      const qtyTd = document.createElement('td');
      qtyTd.textContent = qty;
      qtyTd.style.padding = '10px';
      qtyTd.style.textAlign = 'center';
      tr.appendChild(qtyTd);
    }

    // MANUAL QUANTITY cell (always shown)
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

      input.addEventListener('input', (e) => {
        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
        setCookie(cookiePrefix + name, value, 2);
        onManualUpdate?.(index, value);
      });

      manualTd.appendChild(input);
    }
    tr.appendChild(manualTd);

    // Additional columns for extras if enabled
    if (showExtras) {
      const costTd = document.createElement('td');
      costTd.textContent = cost.toFixed(2);
      costTd.style.padding = '10px';
      costTd.style.textAlign = 'center';

      const diffTd = document.createElement('td');
      diffTd.textContent = difference.toFixed(2);
      diffTd.style.padding = '10px';
      diffTd.style.textAlign = 'center';

      const totalValTd = document.createElement('td');
      totalValTd.textContent = totalValueDiff.toFixed(2);
      totalValTd.style.padding = '10px';
      totalValTd.style.textAlign = 'center';

      tr.appendChild(costTd);
      tr.appendChild(diffTd);
      tr.appendChild(totalValTd);
    }

    table.appendChild(tr);

    // Keep all data in this object to be used for export, etc.
    const rowObj = {
      NAME: name,
      ...(showQtyOnHand ? { 'QUANTITY ON HAND': qty } : {}),
      'MANUAL QUANTITY': manualValue,
    };

    if (showExtras) {
      rowObj['COST'] = cost;
      rowObj['DIFFERENCE'] = difference;
      rowObj['TOTAL VALUE DIFFERENCE'] = totalValueDiff;
    }

    tableRows.push(rowObj);
  });

  // Append total row at bottom only if extras shown
  if (showExtras) {
    const totalRow = document.createElement('tr');

    for (let i = 0; i < headers.length - 1; i++) {
      const td = document.createElement('td');
      td.textContent = '';
      td.style.padding = '10px';
      totalRow.appendChild(td);
    }

    const totalTd = document.createElement('td');
    totalTd.textContent = `Total: ${totalValueDifference.toFixed(2)}`;
    totalTd.style.fontWeight = 'bold';
    totalTd.style.textAlign = 'center';
    totalTd.style.padding = '10px';
    totalTd.style.backgroundColor = '#f0f0f0';
    totalRow.appendChild(totalTd);

    table.appendChild(totalRow);
  }

  return { table, tableRows };
}
