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

            const inventoryContainer = document.getElementById('inventory-container');

            // Create a table to display the data
            const table = document.createElement('table');
            table.border = '1';

            // Add table headers
            const headers = ['NAME', 'MANUAL QUANTITY'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.style.padding = '10px'; // Add spacing to the header cells
                th.style.textAlign = 'center'; // Center-align the header text
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

            let validDataFound = false;
            const tableRows = []; // Collect data for saving to Excel

            // List of invalid names (converted to lowercase)
            const invalidNames = [
                "Chainsaws",
                "DeWalt Light",
                "Drill (Impact)",
                "Drill (Regular)",
                "Multi-Tool",
                "Post Hole Diggers",
                "Push Lawn Mower",
                "Sawzall",
                "Skillsaw",
                "Snow Blower",
                "Snow Shovels",
                "Speed Bumps",
                "Sprayer Backpacks",
                "Stihl bf-km",
                "Stihl blowers",
                "Weed Whips"
            ].map(name => name.toLowerCase());

            // Process each row, skipping invalid data
            parsedData.slice(1).forEach((row, index) => {
                const name = row["__EMPTY"]?.trim(); // Trim whitespace and handle undefined
                const quantity = parseInt(row["__EMPTY_2"], 10);
                const restock = parseInt(row["__EMPTY_3"], 10);

                // Skip rows with invalid data
                if (
                    !name || 
                    isNaN(quantity) || 
                    isNaN(restock) || 
                    quantity > restock || 
                    name.toLowerCase().startsWith('zz') || 
                    invalidNames.includes(name.toLowerCase()) // Compare in lowercase
                ) {
                    return; // Skip invalid rows
                }

                const tableRow = document.createElement('tr');

                // Add the "NAME" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                nameCell.style.padding = '10px'; // Add spacing to cells
                tableRow.appendChild(nameCell);

                // Add the "MANUAL QUANTITY" column
                const manualQuantityCell = document.createElement('td');
                const manualInput = document.createElement('input');
                manualInput.type = 'number';
                manualInput.placeholder = 'Enter value';
                manualInput.style.width = '100%'; // Fill the cell width
                manualInput.style.textAlign = 'center'; // Center-align input text

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

                // Save initial row data for Excel export
                const rowData = { NAME: name, 'MANUAL QUANTITY': null };
                tableRows.push(rowData);

                // Update the manual quantity value on input
                manualInput.addEventListener('input', (e) => {
                    rowData['MANUAL QUANTITY'] = e.target.value ? parseFloat(e.target.value) : null; // Ensure numeric type
                });

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

                // Add click event to send the table data via email
                sendButton.addEventListener('click', () => {
                    try {
                        // Re-sync manual quantities before generating the workbook
                        const allTableRows = document.querySelectorAll('table tr');
                        allTableRows.forEach((row, index) => {
                            if (index === 0) return; // Skip header row
                            const manualInput = row.querySelector('input[type="number"]');
                            if (manualInput) {
                                tableRows[index - 1]['MANUAL QUANTITY'] = manualInput.value ? parseFloat(manualInput.value) : null;
                            }
                        });

                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'; // Replace spaces with underscores
                        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-'); // Replace slashes with dashes for filename compatibility

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(tableRows, { header: headers });

                        // Apply column widths to prevent text truncation
                        worksheet['!cols'] = [
                            { wch: 50 }, // Wider NAME column
                            { wch: 20 }  // MANUAL QUANTITY column width
                        ];

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
                        // Clear cookies
                        document.cookie.split(';').forEach(cookie => {
                            const eqPos = cookie.indexOf('=');
                            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
                        });

                        // Open email client after a slight delay
                        setTimeout(() => {
                            // Prepare email
                            const email = 'hill101779@gmail.com';
                            const emailType = "Restock"; // You can adjust this dynamically if needed
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
                noDataMessage.textContent = 'No valid restock data to display.';
                inventoryContainer.appendChild(noDataMessage);
            }
        } catch (error) {
            console.error('Error parsing Excel data or building the table:', error);
            alert('Failed to parse Excel data.');
        }
    } else {
        const warningMessage = document.createElement('p');
        warningMessage.textContent = 'No restock data available.';
        document.getElementById('inventory-container').appendChild(warningMessage);
    }
};
