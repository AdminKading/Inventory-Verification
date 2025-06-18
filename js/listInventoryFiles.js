const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8TC52oIfNt5pVyph38i8kfomJsqpg9fLwxahcnsdQJDyIywg_e08yjmwRRCRrBk2wBA/exec';

// Extract shop name from localStorage directly (no imports)
function extractShopNameFromStorage() {
  try {
    const raw = localStorage.getItem('excelData');
    if (!raw) return 'Unknown_Shop';
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return 'Unknown_Shop';

    const locEntry = data.find(item => item["Inventory Status"] && item["Inventory Status"].startsWith("Locations:"));
    if (!locEntry) return 'Unknown_Shop';

    return locEntry["Inventory Status"].split(': ')[1].trim().replace(/\s+/g, '_').toLowerCase();
  } catch {
    return 'Unknown_Shop';
  }
}

// Global JSONP callback to receive grouped file list
window.handleInventoryData = function (data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  if (!data || Object.keys(data).length === 0) {
    container.textContent = 'No files found.';
    return;
  }

  const currentShop = extractShopNameFromStorage();

  let foundAny = false;

  Object.entries(data).forEach(([monthYear, files]) => {
    // Filter files by currentShop presence in filename (case-insensitive)
    const filteredFiles = files.filter(filename => filename.toLowerCase().includes(currentShop));

    if (filteredFiles.length === 0) return; // skip this month if no files match

    foundAny = true;

    const section = document.createElement('section');
    section.className = 'inventory-section';

    const header = document.createElement('h3');
    header.textContent = monthYear;
    header.className = 'inventory-month';
    section.appendChild(header);

    filteredFiles.forEach(filename => {
      const wrapper = document.createElement('div');
      wrapper.className = 'file-entry';

      const mode = window.MODE || 'Inventory';

      // View link (no access restriction)
      const viewLink = document.createElement('a');
      viewLink.href = `viewCount.html?file=${encodeURIComponent(filename)}&mode=${encodeURIComponent(mode)}`;
      viewLink.textContent = filename.replace(/\.[^/.]+$/, '');
      viewLink.className = 'inventory-file';
      wrapper.appendChild(viewLink);

      // Download link (admin only)
      const downloadLink = document.createElement('a');
      downloadLink.href = '#'; // Placeholder
      downloadLink.className = 'download-icon';
      downloadLink.title = 'Download';
      downloadLink.addEventListener('click', (e) => {
        e.preventDefault();

        if (typeof hasAdminAccess === 'function' && hasAdminAccess()) {
          const downloadUrl = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(filename)}&mode=${encodeURIComponent(mode)}&download=true`;
          const downloadWindow = window.open(downloadUrl, '_blank');
          if (downloadWindow) {
            setTimeout(() => {
              downloadWindow.close();
            }, 5000); // close after 1.5 seconds
          } else {
            alert('Pop-up blocked! Please allow pop-ups for this site to download files.');
          }
        } else {
          alert('You do not have permission to download this file. Please log in as an admin.');
          if (typeof showPasswordPrompt === 'function') showPasswordPrompt();
        }
      });

      wrapper.appendChild(downloadLink);
      section.appendChild(wrapper);
    });

    container.appendChild(section);
  });

  if (!foundAny) {
    container.textContent = 'No files found for the current shop.';
  }
};

function loadFileList() {
  const oldScript = document.querySelector('script[data-jsonp-loader]');
  if (oldScript) oldScript.remove();

  const script = document.createElement('script');
  const mode = window.MODE || 'Inventory';
  script.src = `${APPS_SCRIPT_URL}?mode=${encodeURIComponent(mode)}&callback=handleInventoryData`;
  script.setAttribute('data-jsonp-loader', 'true');
  document.body.appendChild(script);
}

window.addEventListener('DOMContentLoaded', loadFileList);
