import { createInventoryTable } from './ui.js';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8TC52oIfNt5pVyph38i8kfomJsqpg9fLwxahcnsdQJDyIywg_e08yjmwRRCRrBk2wBA/exec';

function getQueryParam(param) {
  const value = new URLSearchParams(window.location.search).get(param);
  console.log(`getQueryParam("${param}") = "${value}"`);
  return value;
}

function base64ToUint8Array(base64) {
  console.log('Starting base64 to Uint8Array conversion...');
  const raw = atob(base64);
  const length = raw.length;
  const array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  console.log('Base64 conversion completed.');
  return array;
}

async function parseExcelFile(uint8array) {
  console.log('Parsing Excel file from Uint8Array...');
  const workbook = XLSX.read(uint8array, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  console.log('First sheet found:', firstSheetName);
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(`Parsed ${jsonData.length} row(s) from Excel file.`);
  return jsonData;
}

function loadInventoryFile(fileName) {
  console.log(`Loading inventory file "${fileName}" from Apps Script...`);
  const container = document.getElementById('inventory-container');
  container.innerHTML = '<div class="loading">Loading...</div>';

  const callbackName = 'handleFileBase64_' + Date.now();

  window[callbackName] = async function (json) {
    console.log(`JSONP callback "${callbackName}" received response:`, json);

    if (json.error) {
      alert('Error loading file: ' + json.error);
      console.error('Apps Script error:', json.error);
      delete window[callbackName];
      return;
    }

    try {
      const bytes = base64ToUint8Array(json.base64);
      const data = await parseExcelFile(bytes);

      // Filter out empty rows (no name)
      const cleanData = data.filter(row => {
        const name = (row["__EMPTY"] ?? row["NAME"] ?? '').toString().trim();
        return name !== '';
      });

      console.log(`Rendering table with ${cleanData.length} valid row(s) (read-only mode)...`);
      container.innerHTML = '';  // Clear loading message

      const { table } = createInventoryTable(cleanData, null, true); // readOnly = true
      container.appendChild(table);
      console.log('Table rendered successfully and appended to DOM.');
    } catch (e) {
      alert('Error parsing Excel file: ' + e.message);
      console.error('Error during file parsing/rendering:', e);
    }

    delete window[callbackName];
  };

  const script = document.createElement('script');
  const mode = window.MODE || 'Inventory';
  script.src = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(fileName)}&mode=${encodeURIComponent(mode)}&callback=${callbackName}`;

  console.log('Appending dynamic <script> tag with src:', script.src);
  document.body.appendChild(script);
}

// Helper to get cookie
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) return val;
  }
  return null;
}

// Check admin access before anything else
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded. Checking admin access...');
  const userpass = getCookie('userpass');
  if (userpass !== 'adminpassword') {
    alert('You do not have permission to view this file. Redirecting to login page.');
    window.location.href = '../index.html';
    return;
  }

  console.log('Admin access confirmed. Starting inventory file load.');
  const fileName = getQueryParam('file');
  if (!fileName) {
    alert('No file specified in URL.');
    console.error('Missing file query parameter.');
    return;
  }
  loadInventoryFile(fileName);
});
