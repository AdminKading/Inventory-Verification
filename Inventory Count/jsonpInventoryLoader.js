// This function is called by the JSONP response from the Google Apps Script Web App
window.handleInventoryData = function (data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  for (const [month, files] of Object.entries(data)) {
    // Section wrapper with grey bubble styling
    const section = document.createElement('div');
    section.className = 'inventory-section';

    // Month title
    const header = document.createElement('div');
    header.className = 'inventory-month';
    header.textContent = month;
    section.appendChild(header);

    // Files under that month
    files.forEach(filename => {
      const link = document.createElement('a');
      link.className = 'inventory-file';
      link.textContent = filename;
      link.href = '#'; // Placeholder — replace with actual link logic if needed
      link.target = '_blank';
      section.appendChild(link);
    });

    container.appendChild(section);
  }
};

// Create a <script> tag to load JSONP data from Google Apps Script
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
