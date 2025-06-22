const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9DyMKIjn3jz1RkM87gwDKrvI1NKuI2HhP8o_Fa3-Zg0-H08aUv-E6b-nJxs5m3FSkOg/exec';

window.handleInventoryData = function (data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  const sortOrder = document.getElementById('sort-select')?.value || 'asc';
  const filterMonth = document.getElementById('month-select')?.value || 'All';
  const filterYear = document.getElementById('year-select')?.value || 'All';
  const filterShopRaw = document.getElementById('shop-input')?.value || '';
  const filterShop = filterShopRaw.toLowerCase().replace(/\s+/g, '_');

  // Populate year select only once
  const yearSelect = document.getElementById('year-select');
  if (yearSelect && yearSelect.options.length === 1) {
    const years = new Set(Object.keys(data).map(key => key.split(' ')[1]));
    [...years].sort().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }

  // Filter files by month, year, and shop
  const filtered = Object.entries(data).filter(([monthYear, files]) => {
    const [month, year] = monthYear.split(' ');
    if (filterMonth !== 'All' && month !== filterMonth) return false;
    if (filterYear !== 'All' && year !== filterYear) return false;

    // Filter files inside this monthYear group by shop filter
    if (filterShop) {
      // Keep only groups where at least one file includes shop filter
      const hasShopFile = files.some(f =>
        f.toLowerCase().includes(filterShop)
      );
      if (!hasShopFile) return false;
    }
    return true;
  });

  // Sort groups by date
  filtered.sort((a, b) => {
    const dateA = new Date(`${a[0]} 1`);
    const dateB = new Date(`${b[0]} 1`);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (filtered.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No files found for the selected filters.';
    msg.style.color = 'lightgray';
    container.appendChild(msg);
    return;
  }

  filtered.forEach(([monthYear, files]) => {
    // Filter files again by shop inside group (if shop filter active)
    const filesToShow = filterShop
      ? files.filter(f => f.toLowerCase().includes(filterShop))
      : files;

    if (filesToShow.length === 0) return;

    const section = document.createElement('section');
    section.className = 'inventory-section';

    const header = document.createElement('h3');
    header.className = 'inventory-month';
    header.textContent = monthYear;
    section.appendChild(header);

    filesToShow.forEach(filename => {
      // Format display name: e.g. Adel_Shop_Inventory_Count_04-02-2025.xlsx
      const display = filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .split('_')
        .reduce((acc, part, i) => {
          if (i === 1 || i === 3) return acc + part + ' ';
          if (i === 2 || i === 4) return acc.trim() + ' | ' + part + ' ';
          return acc + part + ' ';
        }, '')
        .trim();

      // File link container with open and download buttons
      const fileContainer = document.createElement('div');
      fileContainer.className = 'file-container';

      // Open link
      const link = document.createElement('a');
      link.className = 'inventory-file';
      link.href = '#';
      link.textContent = display;
      link.title = 'View file JSON data';
      link.onclick = (e) => {
        e.preventDefault();
        loadInventoryFile(filename);
      };

      // Download button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download';
      downloadBtn.title = 'Download file';
      downloadBtn.className = 'download-button';
      downloadBtn.onclick = (e) => {
        e.preventDefault();
        downloadInventoryFile(filename);
      };

      fileContainer.appendChild(link);
      fileContainer.appendChild(downloadBtn);
      section.appendChild(fileContainer);
    });

    container.appendChild(section);
  });
};

function loadInventoryFile(fileName) {
  const callbackName = 'handleFileJson_' + Date.now();

  window[callbackName] = function (json) {
    if (json.error) {
      alert('Error loading file: ' + json.error);
    } else {
      localStorage.setItem('excelData', JSON.stringify(json));
      window.location.href = '../html/viewCount.html';
    }
    delete window[callbackName];
  };

  const script = document.createElement('script');
  script.src = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(fileName)}&callback=${callbackName}&mode=inventory`;
  document.body.appendChild(script);
}

function downloadInventoryFile(fileName) {
  // Redirect to your backend with download=true to trigger direct download redirect
  const url = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(fileName)}&download=true&mode=inventory`;
  window.open(url, '_blank');
}

function refreshFileList() {
  const oldScript = document.querySelector('script[data-jsonp-loader]');
  if (oldScript) oldScript.remove();

  const shopInput = document.getElementById('shop-input');
  const shopParam = shopInput ? shopInput.value.trim() : '';

  const script = document.createElement('script');
  let url = `${APPS_SCRIPT_URL}?callback=handleInventoryData&mode=inventory`;
  if (shopParam) {
    url += `&shop=${encodeURIComponent(shopParam)}`;
  }
  script.src = url;
  script.setAttribute('data-jsonp-loader', 'true');
  document.body.appendChild(script);
}

window.addEventListener('DOMContentLoaded', () => {
  // Attach listeners for filters if they exist
  ['sort-select', 'month-select', 'year-select', 'shop-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', refreshFileList);
  });

  refreshFileList();
});
