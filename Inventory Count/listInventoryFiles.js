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
      const link = document.createElement('a');
      link.href = `viewCount.html?file=${encodeURIComponent(filename)}`;
      link.textContent = filename.replace(/\.[^/.]+$/, ''); // remove extension
      link.className = 'inventory-file';
      section.appendChild(link);
    });

    container.appendChild(section);
  });
};

function loadFileList() {
  const oldScript = document.querySelector('script[data-jsonp-loader]');
  if (oldScript) oldScript.remove();

  const script = document.createElement('script');
  script.src = `${APPS_SCRIPT_URL}?callback=handleInventoryData`;
  script.setAttribute('data-jsonp-loader', 'true');
  document.body.appendChild(script);
}

window.addEventListener('DOMContentLoaded', loadFileList);
