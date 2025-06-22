import { getExcelData, clearCookies, extractShopName } from './data.js';
import { filterValidRows } from './logic.js';
import { createInventoryTable } from './ui.js';
import { exportToExcel } from './exporter.js';
import { sendToGoogleDrive } from './driveUploader.js';

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || 'Inventory';

  const data = getExcelData();
  if (!data) {
    document.getElementById('inventory-container').innerText = 'No data found.';
    return;
  }

  const validRows = filterValidRows(data, mode);
  const container = document.getElementById('inventory-container');
  const tableState = { rows: [] };

  const prefix = mode === 'Inventory' ? 'InventoryCount_' : mode + 'Count_';

  // Show only NAME and MANUAL QUANTITY in UI (you can toggle this)
  const showQtyOnHand = false;
  // Hide COST, DIFFERENCE, TOTAL VALUE DIFFERENCE columns from UI but keep for export
  const showExtras = false;

  // Create UI table with minimal columns for editing manual quantity
  const { table, tableRows } = createInventoryTable(validRows, null, false, prefix, showQtyOnHand, showExtras);
  tableState.rows = tableRows;
  container.appendChild(table);

  const btnDiv = document.createElement('div');
  btnDiv.className = 'button-container';
  btnDiv.style.display = 'flex';
  btnDiv.style.justifyContent = 'center';

  const send = document.createElement('button');
  send.id = 'send';
  send.textContent = `Send ${mode} Count`;

  send.onclick = () => {
    const shopName = extractShopName(data);
    let totalValueDiff = 0;

    // Build export rows with full info including cost and differences
    const exportRows = validRows.map((row, index) => {
      const nameRaw = row["__EMPTY"] ?? row["NAME"] ?? '';
      const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"];
      const costRaw = row["__EMPTY_3"] ?? row["COST"];

      const name = nameRaw.toString().trim();
      const qty = (qtyRaw === undefined || qtyRaw === '') ? 0 : parseFloat(qtyRaw) || 0;
      const cost = (costRaw === undefined || costRaw === '') ? 0 : parseFloat(costRaw) || 0;

      const manualInput = document.querySelector(`#manual-${index}`);
      let manualQty = 0;
      if (manualInput) {
        manualQty = parseFloat(manualInput.value);
        if (isNaN(manualQty)) manualQty = NaN;
      } else {
        manualQty = NaN;
      }

      const diff = isNaN(manualQty) ? NaN : manualQty - qty;
      const total = isNaN(diff) ? 0 : diff * cost;
      totalValueDiff += total;

      return {
        NAME: name,
        'QUANTITY ON HAND': qty,
        'MANUAL QUANTITY': manualQty,
        COST: cost,
        DIFFERENCE: diff,
        'TOTAL VALUE DIFFERENCE': total
      };
    });

    // Check if any manual quantity is missing or invalid (NaN)
    const hasMissing = exportRows.some(row => isNaN(row['MANUAL QUANTITY']));

    if (hasMissing) {
      const confirmFill = confirm('One or more manual quantities are missing or invalid. Do you want to proceed by assigning a value of 0 to those entries?');
      if (!confirmFill) return;

      // Replace NaN manual quantities with 0 and recalc totals
      exportRows.forEach(row => {
        if (isNaN(row['MANUAL QUANTITY'])) {
          row['MANUAL QUANTITY'] = 0;
          row['DIFFERENCE'] = 0 - row['QUANTITY ON HAND'];
          row['TOTAL VALUE DIFFERENCE'] = row['DIFFERENCE'] * row['COST'];
        }
      });

      // Recalculate totalValueDiff after fixing missing
      totalValueDiff = exportRows.reduce((sum, r) => sum + (r['TOTAL VALUE DIFFERENCE'] || 0), 0);
    }

    // Append total row for Inventory mode
    if (mode === 'Inventory') {
      const totalRow = {
        NAME: '',
        'QUANTITY ON HAND': '',
        'MANUAL QUANTITY': '',
        COST: '',
        DIFFERENCE: '',
        'TOTAL VALUE DIFFERENCE': `Total: ${totalValueDiff.toFixed(2)}`
      };
      exportRows.push(totalRow);
    }

    const blob = exportToExcel(exportRows, shopName, mode, true);

    sendToGoogleDrive(blob, shopName, mode)
      .then(() => {
        clearCookies(mode);
        location.reload();
      })
      .catch(() => {
        alert('Upload failed or interrupted.');
      });
  };

  btnDiv.append(send);
  container.appendChild(btnDiv);
};
