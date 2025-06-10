window.onload = () => {
    // Retrieve the uploaded Excel data from localStorage
    const excelData = localStorage.getItem('excelData');
    console.log('Excel Data in Local Storage:', excelData); // Log the raw data

    if (excelData) {
        try {
            // Parse the JSON string back into an array of objects
            const parsedData = JSON.parse(excelData);
            console.log('Parsed Data:', parsedData); // Log the parsed data structure

            // Get the container element
            const inventoryContainer = document.getElementById('inventory-container');

            // Create a table to display the data
            const table = document.createElement('table');
            table.border = '1';

            // Add table headers
            const headers = ['NAME', 'QUANTITY ON HAND'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.style.fontSize = '16px'; // Set font size for headers
                th.style.padding = '10px'; // Add padding for better spacing
                th.style.textAlign = 'center'; // Center-align header text
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Add rows for each inventory item
            let validDataFound = false;

            // Skip the first row (header row) in parsedData
            parsedData.slice(1).forEach(row => {
                const name = row["__EMPTY"];
                const quantity = row["__EMPTY_9"];
                if (!name || quantity == null || name === 'Name' || quantity === 'Quantity' || name.toLowerCase().startsWith('zz')) {
                    return; // Skip invalid rows
                }
                const tableRow = document.createElement('tr');

                // Add the "Name" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                nameCell.style.fontSize = '16px'; // Set font size for NAME cells
                nameCell.style.padding = '10px'; // Add padding for spacing
                tableRow.appendChild(nameCell);

                // Add the "Quantity" column
                const quantityCell = document.createElement('td');
                quantityCell.textContent = quantity;
                quantityCell.style.fontSize = '16px'; // Set font size for QUANTITY ON HAND cells
                quantityCell.style.padding = '10px'; // Add padding for spacing
                tableRow.appendChild(quantityCell);

                table.appendChild(tableRow);
                validDataFound = true;
            });

            if (validDataFound) {
                // Add the table to the container
                inventoryContainer.appendChild(table);
            } else {
                console.warn('No valid inventory data found.');
                const noDataMessage = document.createElement('p');
                noDataMessage.textContent = 'No valid inventory data to display.';
                inventoryContainer.appendChild(noDataMessage);
            }
        } catch (error) {
            console.error('Error parsing Excel data:', error);
        }
    } else {
        console.warn('No Excel data found in Local Storage.');
        const warningMessage = document.createElement('p');
        warningMessage.textContent = 'No inventory data available.';
        document.getElementById('inventory-container').appendChild(warningMessage);
    }
};
