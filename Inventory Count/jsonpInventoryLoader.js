window.handleInventoryData = function(data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  const sortSelect = document.getElementById('sort-select');
  const monthSelect = document.getElementById('month-select');
  const yearSelect = document.getElementById('year-select');

  const sortOrder = sortSelect ? sortSelect.value : 'desc';
  const filterMonth = monthSelect ? monthSelect.value : 'All';
  const filterYear = yearSelect ? yearSelect.value : 'All';

  if (yearSelect && yearSelect.options.length === 1) {
    const years = new Set();
    for (const key in data) {
      const [, year] = key.split(' ');
      years.add(year);
    }
    Array.from(years).sort().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }

  const filteredEntries = Object.entries(data).filter(([monthYear]) => {
    const [month, year] = monthYear.split(' ');
    if (filterMonth !== 'All' && filterMonth !== month) return false;
    if (filterYear !== 'All' && filterYear !== year) return false;
    return true;
  });

  filteredEntries.sort((a, b) => {
    const [monthA, yearA] = a[0].split(' ');
    const [monthB, yearB] = b[0].split(' ');

    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);

    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (filteredEntries.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No files found for the selected filter.';
    noResults.style.color = 'lightgray';
    container.appendChild(noResults);
    return;
  }

  filteredEntries.forEach(([monthYear, files]) => {
    const section = document.createElement('section');
    section.className = 'inventory-section';

    const header = document.createElement('h3');
    header.className = 'inventory-month';
    header.textContent = monthYear;
    section.appendChild(header);

    files.forEach(filename => {
      // Remove extension
      let name = filename.replace(/\.[^/.]+$/, '');

      // Split by underscore
      let parts = name.split('_');

      let displayName = '';

      if (parts.length >= 5) {
        const part1 = parts[0] + ' ' + parts[1];      // Adel Shop
        const part2 = parts[2] + ' ' + parts[3];      // Inventory Count
        const part3 = parts.slice(4).join(' ');       // date or other parts
        displayName = `${part1} | ${part2} | ${part3}`;
      } else {
        displayName = parts.join(' ');
      }

      const link = document.createElement('a');
      link.className = 'inventory-file';
      link.href = '#'; // update if needed
      link.textContent = displayName;
      section.appendChild(link);
    });

    container.appendChild(section);
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const controls = ['sort-select', 'month-select', 'year-select'].map(id => document.getElementById(id));

  controls.forEach(control => {
    if (control) {
      control.addEventListener('change', () => {
        const oldScript = document.querySelector('script[data-jsonp-loader]');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = 'https://script.google.com/macros/s/AKfycbx9DyMKIjn3jz1RkM87gwDKrvI1NKuI2HhP8o_Fa3-Zg0-H08aUv-E6b-nJxs5m3FSkOg/exec?callback=handleInventoryData';
        script.setAttribute('data-jsonp-loader', 'true');
        document.body.appendChild(script);
      });
    }
  });

  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbx9DyMKIjn3jz1RkM87gwDKrvI1NKuI2HhP8o_Fa3-Zg0-H08aUv-E6b-nJxs5m3FSkOg/exec?callback=handleInventoryData';
  script.setAttribute('data-jsonp-loader', 'true');
  document.body.appendChild(script);
});
