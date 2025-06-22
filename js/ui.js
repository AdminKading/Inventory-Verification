import { getCookie, setCookie } from './data.js';

export function createInventoryTable(
  rows,
  onManualUpdate = null,
  readOnly = false,
  cookiePrefix = '',
  showQtyOnHand = true,
  showExtras = true
) {
  const table = document.createElement('table');
  table.border = '1';

  const headerRow = document.createElement('tr');
  const headers = ['NAME'];
  if (showQtyOnHand) headers.push('SYSTEM QUANTITY');
  headers.push('MANUAL QUANTITY');
  if (showExtras) headers.push('SYSTEM COST', 'MANUAL COST', 'QUANTITY DIFFERENCE', 'COST DIFFERENCE');

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.padding = '10px';
    th.style.textAlign = 'center';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const tableRows = [];
  let totalCostDifference = 0;

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const nameRaw = row["__EMPTY"] ?? row["NAME"] ?? '';
    const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"] ?? row["SYSTEM QUANTITY"];
    const costRaw = row["__EMPTY_3"] ?? row["COST ($)"] ?? row["SYSTEM COST"];

    const name = nameRaw.toString().trim();
    const qty = (qtyRaw === undefined || qtyRaw === '') ? 0 : parseFloat(qtyRaw) || 0;
    const costRawCleaned = (costRaw === undefined || costRaw === '') ? '0' : costRaw.toString().replace(/[^0-9.\-]+/g, '');
    const totalCost = parseFloat(costRawCleaned) || 0;
    const cost = (qty !== 0) ? totalCost / qty : 0;

    let manualValue = 0;
    if (readOnly) {
      const raw = row["MANUAL QUANTITY"];
      manualValue = raw === undefined || raw === '' || isNaN(raw) ? -1 : parseFloat(raw);
    } else {
      const cookieVal = getCookie(cookiePrefix + name);
      manualValue = cookieVal === undefined || cookieVal === '' || isNaN(cookieVal)
        ? -1
        : parseFloat(cookieVal);
    }

    const systemCost = (manualValue === -1) ? null : qty * cost;
    const manualCost = (manualValue === -1) ? null : manualValue * cost;
    const difference = (manualValue === -1) ? null : manualValue - qty;
    const costDifference = (manualValue === -1) ? null : manualCost - systemCost;

    if (manualValue !== -1) {
      totalCostDifference += costDifference;
    }

    const nameTd = document.createElement('td');
    nameTd.textContent = name;
    nameTd.style.padding = '10px';
    tr.appendChild(nameTd);

    if (showQtyOnHand) {
      const qtyTd = document.createElement('td');
      qtyTd.textContent = qty;
      qtyTd.style.padding = '10px';
      qtyTd.style.textAlign = 'center';
      tr.appendChild(qtyTd);
    }

    const manualTd = document.createElement('td');
    manualTd.style.padding = '10px';
    manualTd.style.textAlign = 'center';

    if (readOnly) {
      if (manualValue === -1) {
        const xSpan = document.createElement('span');
        xSpan.textContent = 'x';
        xSpan.style.color = 'orange';
        manualTd.appendChild(xSpan);
      } else {
        manualTd.textContent = manualValue;
      }
    } else {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = manualValue === -1 ? '' : manualValue;
      input.id = `manual-${index}`;

      input.addEventListener('input', (e) => {
        if (e.target.value === '') {
          setCookie(cookiePrefix + name, -1, 2);
          onManualUpdate?.(index, -1);
        } else {
          const value = parseFloat(e.target.value);
          setCookie(cookiePrefix + name, value, 2);
          onManualUpdate?.(index, value);
        }
      });

      manualTd.appendChild(input);
    }
    tr.appendChild(manualTd);

    if (showExtras) {
      const sysCostTd = document.createElement('td');
      sysCostTd.textContent = (systemCost === null) ? '' : (readOnly ? `$${systemCost.toFixed(2)}` : systemCost.toFixed(2));
      sysCostTd.style.padding = '10px';
      sysCostTd.style.textAlign = 'center';

      const manCostTd = document.createElement('td');
      manCostTd.textContent = (manualCost === null) ? '' : (readOnly ? `$${manualCost.toFixed(2)}` : manualCost.toFixed(2));
      manCostTd.style.padding = '10px';
      manCostTd.style.textAlign = 'center';

      const diffTd = document.createElement('td');
      diffTd.textContent = (difference === null) ? '' : formatSigned(difference);
      diffTd.style.color = (difference === null) ? 'black' : getColor(difference);
      diffTd.style.padding = '10px';
      diffTd.style.textAlign = 'center';

      const costDiffTd = document.createElement('td');
      costDiffTd.textContent = (costDifference === null)
        ? ''
        : (readOnly ? `$${formatSigned(costDifference.toFixed(2))}` : formatSigned(costDifference.toFixed(2)));
      costDiffTd.style.color = (costDifference === null) ? 'black' : getColor(costDifference);
      costDiffTd.style.padding = '10px';
      costDiffTd.style.textAlign = 'center';

      tr.appendChild(sysCostTd);
      tr.appendChild(manCostTd);
      tr.appendChild(diffTd);
      tr.appendChild(costDiffTd);
    }

    table.appendChild(tr);

    const rowObj = {
      NAME: name,
      ...(showQtyOnHand ? { 'SYSTEM QUANTITY': qty } : {}),
      'MANUAL QUANTITY': manualValue,
    };

    if (showExtras) {
      rowObj['SYSTEM COST'] = systemCost;
      rowObj['MANUAL COST'] = manualCost;
      rowObj['QUANTITY DIFFERENCE'] = difference;
      rowObj['COST DIFFERENCE'] = costDifference;
    }

    tableRows.push(rowObj);
  });

  if (showExtras) {
    const totalRow = document.createElement('tr');
    for (let i = 0; i < headers.length - 1; i++) {
      const td = document.createElement('td');
      td.textContent = '';
      td.style.padding = '10px';
      totalRow.appendChild(td);
    }

    const totalTd = document.createElement('td');
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Total: ';

    const totalValue = document.createElement('span');
    totalValue.textContent = `$${totalCostDifference.toFixed(2)}`;
    totalValue.style.color = getColor(totalCostDifference);

    totalTd.appendChild(totalLabel);
    totalTd.appendChild(totalValue);

    totalTd.style.fontWeight = 'bold';
    totalTd.style.textAlign = 'center';
    totalTd.style.padding = '10px';
    totalTd.style.backgroundColor = '#f0f0f0';

    totalRow.appendChild(totalTd);
    table.appendChild(totalRow);
  }

  return { table, tableRows };
}

function formatSigned(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (num > 0) return `+${num}`;
  if (num === 0) return `0`;
  return `${num}`;
}

function getColor(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return 'black';
  if (num > 0) return 'green';
  if (num < 0) return 'red';
  return 'blue';
}
