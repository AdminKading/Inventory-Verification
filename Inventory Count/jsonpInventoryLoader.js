// Called by JSONP from Apps Script
window.handleInventoryData = function(data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  for (const [month, files] of Object.entries(data)) {
    const section = document.createElement('div');
    section.className = 'inventory-section';

    const monthHeader = document.createElement('div');
    monthHeader.className = 'inventory-month';
    monthHeader.textContent = month;
    section.appendChild(monthHeader);

    files.forEach(filename => {
      const fileLink = document.createElement('a');
      fileLink.className = 'inventory-file';
      fileLink.textContent = filename;
      fileLink.href = '#'; // You can replace this with actual file download URL logic if needed
      fileLink.onclick = (e) => {
        e.preventDefault();
        alert(`You clicked on "${filename}"`);
        // Optional: Implement download or navigation logic here
      };
      section.appendChild(fileLink);
    });

    container.appendChild(section);
  }
};

// Dynamically load JSONP from Apps Script
(function loadInventoryData() {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbx9DyMKIjn3jz1RkM87gwDKrvI1NKuI2HhP8o_Fa3-Zg0-H08aUv-E6b-nJxs5m3FSkOg/exec?callback=handleInventoryData';
  script.onerror = () => {
    console.error('Failed to fetch inventory data.');
    const container = document.getElementById('inventory-list');
    if (container) container.textContent = 'Failed to load data.';
  };
  document.body.appendChild(script);
})();
