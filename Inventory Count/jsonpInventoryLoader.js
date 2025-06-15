const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9DyMKIjn3jz1RkM87gwDKrvI1NKuI2HhP8o_Fa3-Zg0-H08aUv-E6b-nJxs5m3FSkOg/exec';

window.handleInventoryData = function (data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  const sortOrder = document.getElementById('sort-select')?.value || 'asc';
  const filterMonth = document.getElementById('month-select')?.value || 'All';
  const filterYear = document.getElementById('year-select')?.value || 'All';

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

  // Filter files by month and year
  const filtered = Object.entries(data).filter(([monthYear]) => {
    const [month, year] = monthYear.split(' ');
    return (filterMonth === 'All' || month === filterMonth) &&
           (filterYear === 'All' || year === filterYear);
  });

  // Sort by date (monthYear string parsed as date)
  filtered.sort((a, b) => {
    const dateA = new Date(`${a[0]} 1`);
    const dateB = new Date(`${b[0]} 1`);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (filtered.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No files found for the selected filter.';
    msg.style.color = 'lightgray';
    container.appendChild(msg);
    return;
  }

  filtered.forEach(([monthYear, files]) => {
    const section = document.createElement('section');
    section.className = 'inventory-section';

    const header = document.createElement('h3');
    header.className = 'inventory-month';
    header.textContent = monthYear;
    section.appendChild(header);

    files.forEach(filename => {
      const original = filename;
      // Format display name, example: Adel_Shop_Inventory_Count_04-02-2025.xlsx
      const display = filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .split('_')
        .reduce((acc, part, i) => {
          if (i === 1 || i === 3) return acc + part + ' ';
          if (i === 2 || i === 4) return acc.trim() + ' | ' + part + ' ';
          return acc + part + ' ';
        }, '')
        .trim();

      const link = document.createElement('a');
      link.className = 'inventory-file';
      link.href = '#';
      link.textContent = display;
      link.onclick = (e) => {
        e.preventDefault();
        loadInventoryFile(original);
      };

      section.appendChild(link);
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
      // Save JSON data to localStorage for viewCount.html
      localStorage.setItem('excelData', JSON.stringify(json));

      // Redirect to view page
      window.location.href = './viewCount.html';
    }
    // Cleanup callback
    delete window[callbackName];
  };

  // Load JSONP script
  const script = document.createElement('script');
  script.src = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(fileName)}&callback=${callbackName}`;
  document.body.appendChild(script);
}

function refreshFileList() {
  const oldScript = document.querySelector('script[data-jsonp-loader]');
  if (oldScript) oldScript.remove();

  const script = document.createElement('script');
  script.src = `${APPS_SCRIPT_URL}?callback=handleInventoryData`;
  script.setAttribute('data-jsonp-loader', 'true');
  document.body.appendChild(script);
}

window.addEventListener('DOMContentLoaded', () => {
  // Attach listeners for filters if they exist
  ['sort-select', 'month-select', 'year-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', refreshFileList);
  });

  refreshFileList();
});
