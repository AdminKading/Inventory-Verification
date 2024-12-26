window.onload = () => {
    // Retrieve the uploaded Excel data from localStorage
    const excelData = localStorage.getItem('excelData');
    console.log('Retrieved Excel Data:', excelData); // Log data for debugging

    if (excelData) {
        try {
            // Parse the JSON string back into an array of objects
            const parsedData = JSON.parse(excelData);
            console.log('Parsed Data:', parsedData); // Log the parsed data structure

            // Correctly locate the value for "Locations: Adel Shop"
            const locationValue = parsedData[1]?.["Inventory By Shop"]; // Extract the second row, "Inventory By Shop" key

            if (locationValue) {
                // Update the header text to the value of "Locations: Adel Shop"
                document.querySelector('header h1').textContent = locationValue.replace("Locations: ", "").trim();
            } else {
                console.warn('Location value not found or is empty.');
            }
        } catch (error) {
            console.error('Error parsing Excel data:', error);
        }
    } else {
        console.warn('No Excel data found in localStorage.');
    }

    // Add event listener to Current Inventory button
    const currentInventoryButton = document.getElementById('current-inventory');
    if (currentInventoryButton) {
        currentInventoryButton.addEventListener('click', () => {
            window.location.href = 'currentinventory.html';
        });
    }
};
