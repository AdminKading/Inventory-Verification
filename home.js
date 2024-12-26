window.onload = () => {

    // Add event listener to Current Inventory button
    const systemInventoryBtn = document.getElementById('system-inventory');
    if (systemInventoryBtn) {
        systemInventoryBtn.addEventListener('click', () => {
            window.location.href = 'currentinventory.html';
        });
    }
    const InventoryCountBtn = document.getElementById('inventory-count');
    if (InventoryCountBtn) {
        InventoryCountBtn.addEventListener('click', () => {
            window.location.href = 'inventorycount.html';
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

