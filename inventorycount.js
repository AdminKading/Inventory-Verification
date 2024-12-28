window.onload = () => {
    // Retrieve the uploaded Excel data from localStorage
    const excelData = localStorage.getItem('excelData');
    console.log('Excel Data in Local Storage:', excelData); // Log the raw data
    const currentPath = window.location.pathname;

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

            // Helper functions to manage cookies
            const setCookie = (key, value, days) => {
                const date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                document.cookie = `${key}=${value};expires=${date.toUTCString()};path=${currentPath}`;
            };

            const getCookie = (key) => {
                const name = `${key}=`;
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    cookie = cookie.trim();
                    if (cookie.indexOf(name) === 0) {
                        return cookie.substring(name.length, cookie.length);
                    }
                }
                return null;
            };

            const clearCookies = () => {
                const cookies = document.cookie.split(';');
                cookies.forEach(cookie => {
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${currentPath}`;
                });
            };

            // Add rows for each inventory item
            let validDataFound = false;
            const tableRows = []; // Collect data for saving to Excel

            parsedData.slice(1).forEach((row, index) => {
                const name = row["__EMPTY"];
                const quantity = row["__EMPTY_2"];

                if (!name || quantity == null || name === 'Name' || quantity === 'Quantity' || name.toLowerCase().startsWith('zz')) {
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
                manualInput.style.width = '100%';

                // Load saved values from cookies
                const savedValue = getCookie(name);
                if (savedValue !== null) {
                    manualInput.value = savedValue;
                    tableRows.push({ NAME: name, QUANTITY: quantity, 'MANUAL QUANTITY': parseFloat(savedValue) });
                } else {
                    tableRows.push({ NAME: name, QUANTITY: quantity, 'MANUAL QUANTITY': null });
                }

                // Save changes to cookies
                manualInput.addEventListener('input', (e) => {
                    const value = e.target.value;
                    tableRows[index]['MANUAL QUANTITY'] = value ? parseFloat(value) : null;
                    setCookie(name, value, 7); // Save for 7 days
                });

                manualQuantityCell.appendChild(manualInput);
                tableRow.appendChild(manualQuantityCell);
                table.appendChild(tableRow);

                validDataFound = true;
            });

            if (validDataFound) {
                inventoryContainer.appendChild(table);

                // Create the button container
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                // Add Reset button
                const resetButton = document.createElement('button');
                resetButton.id = 'reset';
                resetButton.textContent = 'Reset';
                buttonContainer.appendChild(resetButton);

                // Add Send button
                const sendButton = document.createElement('button');
                sendButton.id = 'send';
                sendButton.textContent = 'Send Inventory Count';
                buttonContainer.appendChild(sendButton);

                // Append the button container to the inventory container
                inventoryContainer.appendChild(buttonContainer);
                // Event for "Reset" button
                resetButton.addEventListener('click', () => {
                    clearCookies();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                        location.reload(); // Reload after scroll finishes
                    }, 700); // 500ms delay to ensure scrolling happens
                });

                // Event for "Send Inventory Count" button
                sendButton.addEventListener('click', () => {
                    try {
                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'; // Replace spaces with underscores
                        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-'); // Replace slashes with dashes for filename compatibility
                
                        // Collect manual quantities and update tableRows
                        const allTableRows = document.querySelectorAll('table tr');
                        allTableRows.forEach((row, index) => {
                            if (index === 0) return; // Skip header row
                            const manualInput = row.querySelector('input[type="number"]');
                            if (manualInput) {
                                tableRows[index - 1]['MANUAL QUANTITY'] = manualInput.value ? parseFloat(manualInput.value) : null; // Ensure numeric type
                            }
                        });
                
                        // Generate Excel file
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
                
                        // Clear cookies
                        document.cookie.split(';').forEach(cookie => {
                            const eqPos = cookie.indexOf('=');
                            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
                        });
                
                        // Open email client after a short delay
                        setTimeout(() => {
                            // Prepare email
                            const email = 'hill101779@gmail.com';
                            const emailType = "Inventory"; // You can adjust this dynamically if needed
                            const subject = `${shopName} | ${emailType} Count | ${currentDate}`;
                            const body = `
                        Hello,
                        
                        Attached is the ${emailType.toLowerCase()} count file for ${shopName.replace(/_/g, ' ')}. This file was generated on ${currentDate}.
                        Please find the Excel document attached.
                        
                        Note: This is an automatic email sent from Inventory Verification. 
                        Visit: https://adminkading.github.io/Inventory-Verification/
                        
                        Best regards,
                        ${shopName.replace(/_/g, ' ')}
                            `.trim();
                        
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
