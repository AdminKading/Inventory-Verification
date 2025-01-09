window.onload = () => {
    // Retrieve Excel data from localStorage
    const excelData = localStorage.getItem('excelData');
    console.log('Excel Data in Local Storage:', excelData); // Log the raw data

    let shopName = 'Unknown_Shop'; // Default shop name

    if (excelData) {
        try {
            const parsedData = JSON.parse(excelData);
            // Extract the shop name from the parsed data
            shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                ?.[ "Inventory By Shop"].split(': ')[1]?.trim() || 'Unknown_Shop';
        } catch (error) {
            console.error('Error parsing Excel data:', error);
        }
    }

    // Update the <h2> element with the shop name
    const titleElement = document.querySelector('h2');
    if (titleElement) {
        titleElement.textContent = `${shopName}`; // Update the text content
    }

    // Add event listener to Exit button
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // Redirect to index.html
        });
    }
};


