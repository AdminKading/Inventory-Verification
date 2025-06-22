// costDifferenceExporter.js
import * as XLSX from 'xlsx';

export function generateInventoryCostExcel(tableRows, rawData) {
  const inventoryData = extractInventoryData(rawData);

  const sheetData = [['NAME', 'QUANTITY ON HAND', 'MANUAL QUANTITY', 'DIFFERENCE IN QUANTITY', 'COST DIFFERENCE']];

  tableRows.forEach(row => {
    const name = row['NAME'];
    const manualQty = parseFloat(row['MANUAL QUANTITY'] || 0);
    const qtyOnHand = parseFloat(row['QUANTITY ON HAND'] || 0);
    const difference = manualQty - qtyOnHand;

    const costPerPart = inventoryData[name] ?? 0;
    const manualCost = manualQty * costPerPart;
    const onHandCost = qtyOnHand * costPerPart;
    const costDifference = manualCost - onHandCost;

    sheetData.push([
      name,
      qtyOnHand,
      manualQty,
      difference >= 0 ? `+${difference}` : `${difference}`,
      costDifference.toFixed(2)
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Summary');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'blob' });
}

function extractInventoryData(json) {
  const map = {};
  for (const row of json) {
    const name = row["__EMPTY"] || row["NAME"];
    const cost = parseFloat(row["__EMPTY_3"]);
    if (name && !isNaN(cost)) {
      map[name.trim()] = cost;
    }
  }
  return map;
}
