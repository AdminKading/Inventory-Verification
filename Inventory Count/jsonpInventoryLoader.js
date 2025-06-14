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
  script.src = 'https://script.google.com/macros/s/AKfycbz3q8LRpL5-CYQUwt5-jb2QAoikcS0eiDRYMBTDYNFIK8ZUMZNSq-7phmNQTdKxBnx_9A/exec?callback=handleInventoryData';
  script.onerror = () => {
    console.error('Failed to fetch inventory data.');
    const container = document.getElementById('inventory-list');
    if(container) container.textContent = 'Failed to load data.';
  };
  document.body.appendChild(script);
})();
