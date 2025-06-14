// This function is called by the JSONP response from the Google Apps Script Web App
window.handleInventoryData = function(data) {
  const container = document.getElementById('inventory-list');
  container.innerHTML = '';

  for (const [month, files] of Object.entries(data)) {
    const header = document.createElement('h3');
    header.textContent = month;

    const ul = document.createElement('ul');
    files.forEach(filename => {
      const li = document.createElement('li');
      li.textContent = filename;
      ul.appendChild(li);
    });

    container.appendChild(header);
    container.appendChild(ul);
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
