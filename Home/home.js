import { getExcelData, extractShopName } from '../Common Files/data.js';

window.onload = () => {
    const data = getExcelData();
    let shopName = extractShopName(data); // ✅ Centralized extraction logic

    // Update the <h2> element with the shop name
    const titleElement = document.querySelector('h2');
    if (titleElement) {
        titleElement.textContent = `${shopName}`;
    }

    // Add event listener to Exit button
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
};
