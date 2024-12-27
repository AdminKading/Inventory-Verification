window.onload = () => {
    // Initialize EmailJS
    emailjs.init("NBLAa3mFvh2IL8Lxe");

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

            let validDataFound = false;
            const tableRows = []; // Collect data for saving to Excel

            parsedData.slice(1).forEach((row, index) => {
                const name = row["__EMPTY"];
                const quantity = parseInt(row["__EMPTY_2"], 10);
                const restock = parseInt(row["__EMPTY_3"], 10);

                // Include only items with Quantity < Restock
                if (!name || isNaN(quantity) || isNaN(restock) || quantity >= restock || name.toLowerCase().startsWith('zz')) {
                    return; // Skip invalid rows
                }

                const tableRow = document.createElement('tr');

                // Add the "NAME" column
                const nameCell = document.createElement('td');
                nameCell.textContent = name.trim(); // Ensure whitespace is trimmed
                nameCell.style.padding = '10px'; // Add spacing to cells
                tableRow.appendChild(nameCell);

                // Add the "MANUAL QUANTITY" column
                const manualQuantityCell = document.createElement('td');
                const manualInput = document.createElement('input');
                manualInput.type = 'number';
                manualInput.placeholder = 'Enter value';
                manualInput.style.width = '100%'; // Fill the cell width
                manualInput.style.textAlign = 'center'; // Center-align input text
                manualQuantityCell.appendChild(manualInput);
                tableRow.appendChild(manualQuantityCell);

                table.appendChild(tableRow);

                // Save initial row data for Excel export
                const rowData = { NAME: name.trim(), 'MANUAL QUANTITY': null };
                tableRows.push(rowData);

                // Update the manual quantity value on input
                manualInput.addEventListener('input', (e) => {
                    rowData['MANUAL QUANTITY'] = e.target.value ? parseFloat(e.target.value) : null; // Ensure numeric type
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
                                tableRows[index - 1]['MANUAL QUANTITY'] = manualInput.value ? parseFloat(manualInput.value) : null;
                            }
                        });

                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'; // Replace spaces with underscores
                        const currentDate = new Date().toLocaleDateString();

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(tableRows, { header: headers });

                        // Apply column widths to prevent text truncation
                        worksheet['!cols'] = [
                            { wch: 50 }, // Wider NAME column
                            { wch: 20 }, // MANUAL QUANTITY column width
                        ];

                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Restock');
                        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                        // Convert Blob to Base64 for EmailJS
                        const reader = new FileReader();
                        reader.onload = function () {
                            const base64File = reader.result.split(',')[1]; // Extract Base64 string

                            // Send the email via EmailJS
                            emailjs.send("service_jydp879", "template_11vi1zf", {
                                shopName: shopName, // Dynamic placeholder for shopName
                                date: currentDate, // Dynamic placeholder for the date
                                emailType: "Restock", // Specify "Restock" or "Inventory"
                                to_email: "hill101779@gmail.com", // Your email address
                                attachment: base64File, // Attach the file as a Base64 string
                                filename: `${shopName}_Restock_Count_${currentDate}.xlsx`,
                            }).then(
                                function (response) {
                                    alert("Email sent successfully!");
                                },
                                function (error) {
                                    console.error("Failed to send email:", error);
                                    alert("Failed to send email.");
                                }
                            );
                        };
                        reader.readAsDataURL(blob); // Convert Blob to Base64
                    } catch (error) {
                        console.error('Error generating Excel file:', error);
                        alert('Failed to generate and send email.');
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
