window.onload = () => {
    // Retrieve the uploaded Excel data from localStorage
    const excelData = localStorage.getItem('excelData');
    console.log('Excel Data in Local Storage:', excelData); // Log the raw data

    if (excelData) {
        try {
            // Parse the JSON string back into an array of objects
            const parsedData = JSON.parse(excelData);
            console.log('Parsed Data:', parsedData); // Log the parsed data structure

            const inventoryContainer = document.getElementById('inventory-container');

            // Create a table to display the data
            const table = document.createElement('table');
            table.border = '1';

            // Add table headers
            const headers = ['Name', 'Manual Quantity'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            let validDataFound = false;
            const tableRows = []; // Collect data for saving to Excel

            parsedData.slice(1).forEach((row) => {
                const name = row["__EMPTY"];
                const quantity = parseInt(row["__EMPTY_2"], 10);
                const reorder = parseInt(row["__EMPTY_3"], 10);

                // Include only items with Quantity < Reorder
                if (!name || isNaN(quantity) || isNaN(reorder) || quantity >= reorder || name.toLowerCase().startsWith('zz')) {
                    return; // Skip invalid rows
                }

                const tableRow = document.createElement('tr');

                // Add the "Name" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                tableRow.appendChild(nameCell);

                // Add the "Manual Quantity" column
                const manualQuantityCell = document.createElement('td');
                const manualInput = document.createElement('input');
                manualInput.type = 'number';
                manualInput.placeholder = 'Enter value';
                manualInput.style.width = '100%'; // Optional: Make input fill the cell
                manualQuantityCell.appendChild(manualInput);
                tableRow.appendChild(manualQuantityCell);

                table.appendChild(tableRow);

                // Save initial row data for Excel export
                const rowData = { Name: name, ManualQuantity: '' };
                tableRows.push(rowData);

                // Update the manual quantity value on input
                manualInput.addEventListener('input', (e) => {
                    rowData.ManualQuantity = `          ${e.target.value}`; // Add 10 spaces in front
                });

                validDataFound = true;
            });

            if (validDataFound) {
                inventoryContainer.appendChild(table);

                // Add the "Send Restock Count" button
                const sendButton = document.createElement('button');
                sendButton.id = 'send';
                sendButton.className = 'send'; // Add a CSS class
                sendButton.textContent = 'Send Restock Count';

                inventoryContainer.appendChild(sendButton);

                // Add click event to send the table data via email
                sendButton.addEventListener('click', () => {
                    try {
                        // Re-sync manual quantities before generating the workbook
                        const allTableRows = document.querySelectorAll('table tr');
                        allTableRows.forEach((row, index) => {
                            if (index === 0) return; // Skip header row
                            const manualInput = row.querySelector('input[type="number"]');
                            if (manualInput) {
                                tableRows[index - 1].ManualQuantity = `          ${manualInput.value || ''}`; // Add 10 spaces in front
                            }
                        });

                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'; // Replace spaces with underscores
                        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-'); // Replace slashes with dashes for filename compatibility

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(tableRows);
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Restock');
                        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                        // Generate dynamic file name
                        const fileName = `${shopName}_Restock_Count_${currentDate}.xlsx`;

                        // Create file download
                        const fileUrl = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = fileUrl;
                        downloadLink.download = fileName;
                        downloadLink.click();

                        // Prepare email
                        const email = 'hill101779@gmail.com';
                        const subject = `${shopName} | Restock Count | ${currentDate}`;
                        const body = `Attached is the restock count. This report was generated on ${currentDate} for ${shopName.replace(/_/g, ' ')}. Please review the details in the attached file.`;

                        // Construct mailto link
                        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.location.href = mailtoLink;

                        alert('Email prepared. Please attach the downloaded Excel file before sending.');
                    } catch (error) {
                        console.error('Error generating Excel file:', error);
                        alert('Failed to generate and send Excel file.');
                    }
                });
            } else {
                const noDataMessage = document.createElement('p');
                noDataMessage.textContent = 'No items require restocking.';
                inventoryContainer.appendChild(noDataMessage);
            }
        } catch (error) {
            console.error('Error parsing Excel data or building the table:', error);
            alert('Failed to parse Excel data.');
        }
    } else {
        const warningMessage = document.createElement('p');
        warningMessage.textContent = 'No inventory data available.';
        document.getElementById('inventory-container').appendChild(warningMessage);
    }
};
