import { getExcelData, extractShopName } from './data.js';

window.onload = () => {
    const data = getExcelData();
    console.log('Data in home.js:', data);  // Debug log to see what's in localStorage

    let shopName = extractShopName(data);
    console.log('Extracted shopName:', shopName);  // Debug log to verify extraction

    // Format the shop name by replacing underscores with spaces
    if (shopName) {
        shopName = shopName.replace(/_/g, ' ');
    }

    // Update the <h2> element with the shop name
    const titleElement = document.querySelector('h2');
    if (titleElement) {
        titleElement.textContent = shopName;
    }

    // Add event listener to Exit button
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            // Adjust path if needed according to your folder structure
            window.location.href = '../index.html';
        });
    }
};
