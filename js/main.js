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

  // No cookie reading here; all done inside createInventoryTable
  const prefix = mode + "Count_";

  const { table, tableRows } = createInventoryTable(validRows, null, false, prefix);
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

    // Update MANUAL QUANTITY values from live inputs in table (input id is manual-{index})
    tableState.rows.forEach((row, index) => {
      const input = document.querySelector(`#manual-${index}`);
      if (input) {
        const val = input.value === '' ? NaN : parseFloat(input.value);
        row['MANUAL QUANTITY'] = val;
      }
    });

    const hasMissing = tableState.rows.some(row => {
      const val = row['MANUAL QUANTITY'];
      return val == null || val === '' || isNaN(val);
    });

    if (hasMissing) {
      const confirmFill = confirm('One or more manual quantities are missing or invalid. Do you want to proceed by assigning a value of 0 to those entries?');
      if (!confirmFill) return;

      tableState.rows.forEach(row => {
        if (row['MANUAL QUANTITY'] == null || row['MANUAL QUANTITY'] === '' || isNaN(row['MANUAL QUANTITY'])) {
          row['MANUAL QUANTITY'] = 0;
        }
      });
    }

    const blob = exportToExcel(tableState.rows, shopName, mode, true);

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
