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
            const headers = ['Name', 'Quantity', 'Manual Quantity'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Add rows for each inventory item
            let validDataFound = false;
            const tableRows = []; // Collect data for saving to Excel

            parsedData.slice(1).forEach((row, index) => {
                const name = row["__EMPTY"];
                const quantity = row["__EMPTY_2"];

                if (!name || !quantity || name === 'Name' || quantity === 'Quantity' || name.toLowerCase().startsWith('zz')) {
                    return; // Skip invalid rows
                }

                const tableRow = document.createElement('tr');

                // Add the "Name" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                tableRow.appendChild(nameCell);

                // Add the "Quantity" column
                const quantityCell = document.createElement('td');
                quantityCell.textContent = quantity;
                tableRow.appendChild(quantityCell);

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
                tableRows.push({ Name: name, Quantity: quantity, ManualQuantity: '' });

                // Update the manual quantity value on input
                manualInput.addEventListener('input', (e) => {
                    tableRows[index].ManualQuantity = e.target.value;
                });

                validDataFound = true;
            });

            if (validDataFound) {
                inventoryContainer.appendChild(table);

                // Add the "Send Inventory Count" button
                const sendButton = document.createElement('button');
                sendButton.id = 'send';
                sendButton.textContent = 'Send Inventory Count';
                sendButton.style.marginTop = '20px'; // Add spacing
                sendButton.style.backgroundColor = 'green';
                sendButton.style.color = 'white';
                sendButton.style.padding = '10px 20px';
                sendButton.style.border = 'none';
                sendButton.style.borderRadius = '5px';
                sendButton.style.cursor = 'pointer';
                sendButton.style.display = 'block';
                sendButton.style.margin = '20px auto';

                inventoryContainer.appendChild(sendButton);

                // Add click event to send the table data via email
                sendButton.addEventListener('click', () => {
                    try {
                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim() || 'Unknown Shop';
                        const currentDate = new Date().toLocaleDateString();
                
                        const allTableRows = document.querySelectorAll('table tr');
                        allTableRows.forEach((row, index) => {
                            if (index === 0) return; // Skip header row
                            const manualInput = row.querySelector('input[type="number"]');
                            if (manualInput) {
                                // Add 10 spaces in front of the manual quantity value
                                tableRows[index - 1].ManualQuantity = `          ${manualInput.value || ''}`;
                            }
                        });
                
                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(tableRows);
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
                        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                
                        // Prepare email
                        const email = 'hill101779@gmail.com';
                        const subject = `${shopName} | Inventory Count | ${currentDate}`;
                        const body = `Attached is the inventory count. This report was generated on ${currentDate} for ${shopName}. Please review the details in the attached file.`;
                
                        // Create file download and send via mailto
                        const fileUrl = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = fileUrl;
                        downloadLink.download = 'Inventory_Count.xlsx';
                        downloadLink.click();
                
                        // Construct mailto link
                        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.location.href = mailtoLink;
                
                        alert('Email prepared with Inventory file attached. Please send manually.');
                    } catch (error) {
                        console.error('Error generating Excel file:', error);
                        alert('Failed to generate and send Excel file.');
                    }
                });
                
                
                
                
                
            } else {
                const noDataMessage = document.createElement('p');
                noDataMessage.textContent = 'No valid inventory data to display.';
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