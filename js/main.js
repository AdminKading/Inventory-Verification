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

  const showQtyOnHand = false;
  const showExtras = false;

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
    let totalCostDiff = 0;

    const exportRows = validRows.map((row, index) => {
      const nameRaw = row["__EMPTY"] ?? row["NAME"] ?? '';
      const qtyRaw = row["__EMPTY_9"] ?? row["QUANTITY ON HAND"];
      const costRaw = row["__EMPTY_3"] ?? row["COST ($)"];

      const name = nameRaw.toString().trim();
      const qty = (qtyRaw === undefined || qtyRaw === '') ? 0 : parseFloat(qtyRaw) || 0;
      const cost = (costRaw === undefined || costRaw === '') ? 0 : parseFloat(costRaw) || 0;

      const manualInput = document.querySelector(`#manual-${index}`);
      let manualQty = -1;
      if (manualInput) {
        manualQty = manualInput.value === '' ? -1 : parseFloat(manualInput.value);
        if (isNaN(manualQty)) manualQty = -1;
      }

      const diffQty = (manualQty === -1) ? 0 : manualQty - qty;
      const costDiff = (manualQty === -1) ? 0 : diffQty * cost;
      totalCostDiff += costDiff;

      return {
        NAME: name,
        'SYSTEM QUANTITY': qty,
        'MANUAL QUANTITY': manualQty,
        'SYSTEM COST': (manualQty === -1) ? 0 : qty * cost,
        'MANUAL COST': (manualQty === -1) ? 0 : manualQty * cost,
        'QUANTITY DIFFERENCE': (manualQty === -1) ? 0 : diffQty,
        'COST DIFFERENCE': (manualQty === -1) ? 0 : costDiff,
        _costUnit: cost
      };
    });

    const hasMissing = exportRows.some(row => row['MANUAL QUANTITY'] === -1);

    if (hasMissing) {
      const confirmFill = confirm('One or more manual quantities are missing or invalid. These entries will not be counted toward the totals. Do you want to proceed anyway?');
      if (!confirmFill) return;
    }

    // Remove the helper _costUnit before export
    const cleanedRows = exportRows.map(({ _costUnit, ...rest }) => rest);

    if (mode === 'Inventory') {
      const totalRow = {
        NAME: '',
        'SYSTEM QUANTITY': '',
        'MANUAL QUANTITY': '',
        'SYSTEM COST': '',
        'MANUAL COST': '',
        'QUANTITY DIFFERENCE': '',
        'COST DIFFERENCE': `Total: ${totalCostDiff.toFixed(2)}`
      };
      cleanedRows.push(totalRow);
    }

    const blob = exportToExcel(cleanedRows, shopName, mode, true);

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
