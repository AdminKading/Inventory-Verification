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

  const prefix = `${mode}Count_`;

  // CONTROL UI columns AND exported columns here
  // Inventory: NO Qty On Hand, WITH extras
  // Restock: WITH Qty On Hand, NO extras
  const showQtyOnHand = mode === 'Restock';
  const showExtras = mode === 'Inventory';

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

    // We already have tableRows built with right columns
    let exportRows = [...tableState.rows];

    // Check for missing manual quantities
    const hasMissing = exportRows.some(row => isNaN(row['MANUAL QUANTITY']));
    if (hasMissing) {
      const confirmFill = confirm('One or more manual quantities are missing or invalid. Do you want to proceed by assigning a value of 0 to those entries?');
      if (!confirmFill) return;

      exportRows.forEach(row => {
        if (isNaN(row['MANUAL QUANTITY'])) {
          row['MANUAL QUANTITY'] = 0;
          if (mode !== 'Restock') {
            row['DIFFERENCE'] = 0 - row['QUANTITY ON HAND'];
            row['TOTAL VALUE DIFFERENCE'] = row['DIFFERENCE'] * row['COST'];
          }
        }
      });
    }

    if (mode === 'Inventory') {
      let totalValueDiff = exportRows.reduce((sum, r) => sum + (r['TOTAL VALUE DIFFERENCE'] || 0), 0);
      exportRows.push({
        NAME: '',
        'QUANTITY ON HAND': '',
        'MANUAL QUANTITY': '',
        COST: '',
        DIFFERENCE: '',
        'TOTAL VALUE DIFFERENCE': `Total: ${totalValueDiff.toFixed(2)}`
      });
    }

    // For Restock, explicitly pass columns to export function to exclude extras
    const columns = mode === 'Restock'
      ? ['NAME', 'QUANTITY ON HAND', 'MANUAL QUANTITY']
      : null;

    const blob = exportToExcel(exportRows, shopName, mode, true, columns);
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
