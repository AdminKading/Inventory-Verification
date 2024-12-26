window.onload = () => {

    // Add event listener to Current Inventory button
    const currentInventoryButton = document.getElementById('current-inventory');
    if (currentInventoryButton) {
        currentInventoryButton.addEventListener('click', () => {
            window.location.href = 'currentinventory.html';
        });
    }

    // Add event listener to Exit button
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // Redirect to index.html
        });
    }
};

