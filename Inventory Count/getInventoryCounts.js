export async function fetchInventoryCounts() {
  const url = 'https://script.google.com/macros/s/AKfycbz3q8LRpL5-CYQUwt5-jb2QAoikcS0eiDRYMBTDYNFIK8ZUMZNSq-7phmNQTdKxBnx_9A/exec'; // 👈 Replace with the deployed Web App URL

  try {
    const response = await fetch(url);
    const data = await response.json();
    renderInventoryData(data);
  } catch (err) {
    console.error('Error fetching inventory data:', err);
    document.getElementById('inventory-list').textContent = 'Failed to load data.';
  }
}

function renderInventoryData(data) {
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
}
