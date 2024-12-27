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
            const headers = ['NAME', 'QUANTITY', 'MANUAL QUANTITY'];
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

                // Add the "NAME" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                tableRow.appendChild(nameCell);

                // Add the "QUANTITY" column
                const quantityCell = document.createElement('td');
                quantityCell.textContent = quantity;
                tableRow.appendChild(quantityCell);

                // Add the "MANUAL QUANTITY" column
                const manualQuantityCell = document.createElement('td');
                const manualInput = document.createElement('input');
                manualInput.type = 'number';
                manualInput.placeholder = 'Enter value';
                manualInput.style.width = '100%'; // Optional: Make input fill the cell
                manualQuantityCell.appendChild(manualInput);
                tableRow.appendChild(manualQuantityCell);

                table.appendChild(tableRow);

                // Save initial row data for Excel export
                tableRows.push({ NAME: name, QUANTITY: quantity, 'MANUAL QUANTITY': null }); // Use null to ensure numeric type

                // Update the manual quantity value on input
                manualInput.addEventListener('input', (e) => {
                    const value = e.target.value;
                    tableRows[index]['MANUAL QUANTITY'] = value ? parseFloat(value) : null; // Convert to number
                });

                validDataFound = true;
            });

            if (validDataFound) {
                inventoryContainer.appendChild(table);

                // Add the "Send Inventory Count" button
                const sendButton = document.createElement('button');
                sendButton.id = 'send';
                sendButton.className = 'send'; // Add a CSS class
                sendButton.textContent = 'Send Inventory Count';

                inventoryContainer.appendChild(sendButton);

                // Add click event to send the table data via email
                sendButton.addEventListener('click', () => {
                    try {
                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'; // Replace spaces with underscores
                        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-'); // Replace slashes with dashes for filename compatibility
                        
                        const allTableRows = document.querySelectorAll('table tr');
                        allTableRows.forEach((row, index) => {
                            if (index === 0) return; // Skip header row
                            const manualInput = row.querySelector('input[type="number"]');
                            if (manualInput) {
                                tableRows[index - 1]['MANUAL QUANTITY'] = manualInput.value ? parseFloat(manualInput.value) : null; // Ensure numeric type
                            }
                        });

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(tableRows, { header: headers });

                        // Apply column widths to prevent text truncation
                        worksheet['!cols'] = [
                            { wch: 50 }, // Wider NAME column
                            { wch: 15 }, // QUANTITY column width
                            { wch: 20 }, // MANUAL QUANTITY column width
                        ];

                        // Style the header row
                        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
                        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                            if (worksheet[cellAddress]) {
                                worksheet[cellAddress].s = {
                                    font: { bold: true }, // Bold text
                                    alignment: { horizontal: 'center', vertical: 'center' }, // Center alignment
                                    border: {
                                        bottom: { style: 'medium', color: { rgb: '000000' } }, // Dark line below header
                                    },
                                };
                            }
                        }

                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
                        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                        // Generate dynamic file name
                        const fileName = `${shopName}_Inventory_Count_${currentDate}.xlsx`;

                        // Create file download
                        const fileUrl = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = fileUrl;
                        downloadLink.download = fileName;
                        downloadLink.click();

                        // Open email client after a short delay
                        setTimeout(() => {
                            // Prepare email
                            const email = 'hill101779@gmail.com';
                            const subject = `${shopName} | Inventory Count | ${currentDate}`;
                            const body = `Attached is the inventory count. This report was generated on ${currentDate} for ${shopName.replace(/_/g, ' ')}. Please review the details in the attached file.`;

                            // Construct mailto link
                            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.location.href = mailtoLink;

                            alert('Email prepared. Please attach the downloaded Excel file before sending.');
                        }, 1000); // Delay ensures download finishes before email opens
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
