const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8TC52oIfNt5pVyph38i8kfomJsqpg9fLwxahcnsdQJDyIywg_e08yjmwRRCRrBk2wBA/exec';

// Global JSONP callback to receive grouped file list
window.handleInventoryData = function (data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  if (!data || Object.keys(data).length === 0) {
    container.textContent = 'No files found.';
    return;
  }

  Object.entries(data).forEach(([monthYear, files]) => {
    const section = document.createElement('section');
    section.className = 'inventory-section';

    const header = document.createElement('h3');
    header.textContent = monthYear;
    header.className = 'inventory-month';
    section.appendChild(header);

    files.forEach(filename => {
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
          window.open(`${APPS_SCRIPT_URL}?filename=${encodeURIComponent(filename)}&mode=${encodeURIComponent(mode)}&download=true`, '_blank');
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
