window.onload = () => {
    const excelData = localStorage.getItem('excelData');
    console.log('Excel Data in Local Storage:', excelData); // Log the raw data
    const currentPath = window.location.pathname;

    if (excelData) {
        try {
            const parsedData = JSON.parse(excelData);
            console.log('Parsed Data:', parsedData); // Log the parsed data structure

            const inventoryContainer = document.getElementById('inventory-container');
            const table = document.createElement('table');
            table.border = '1';

            const headers = ['NAME', 'QUANTITY', 'MANUAL QUANTITY'];
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.style.padding = '10px';
                th.style.textAlign = 'center';
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            const setCookie = (key, value, days) => {
                const date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                const sanitizedKey = key.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize key
                document.cookie = `${sanitizedKey}=${value};expires=${date.toUTCString()};path=${currentPath}`;
                console.log(`Set cookie: ${sanitizedKey} = ${value}`);
            };

            const getCookie = (key) => {
                const sanitizedKey = key.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize key
                const name = `${sanitizedKey}=`;
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
                console.log('All cookies cleared for path:', currentPath);
            };

            const tableRows = new Map(); // Use a Map for unique rows
            let validDataFound = false;

            parsedData.slice(1).forEach(row => {
                const name = row["__EMPTY"]?.trim();
                const quantity = parseInt(row["__EMPTY_2"], 10);

                if (!name || isNaN(quantity) || name.toLowerCase().startsWith('zz')) return; // Skip invalid rows

                if (!tableRows.has(name)) {
                    const rowData = { NAME: name, QUANTITY: quantity, 'MANUAL QUANTITY': null };
                    tableRows.set(name, rowData);
                }

                const savedValue = getCookie(name);
                if (savedValue !== null) {
                    tableRows.get(name)['MANUAL QUANTITY'] = parseFloat(savedValue);
                }
            });

            tableRows.forEach((rowData, name) => {
                const tableRow = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                nameCell.style.padding = '10px';
                tableRow.appendChild(nameCell);

                const quantityCell = document.createElement('td');
                quantityCell.textContent = rowData.QUANTITY;
                quantityCell.style.padding = '10px';
                tableRow.appendChild(quantityCell);

                const manualQuantityCell = document.createElement('td');
                const manualInput = document.createElement('input');
                manualInput.type = 'number';
                manualInput.placeholder = 'Enter value';
                manualInput.style.width = '100%';
                manualInput.style.textAlign = 'center';
                manualInput.value = rowData['MANUAL QUANTITY'] || '';
                manualInput.addEventListener('input', (e) => {
                    rowData['MANUAL QUANTITY'] = parseFloat(e.target.value) || null;
                    setCookie(name, e.target.value, 7);
                });
                manualQuantityCell.appendChild(manualInput);
                tableRow.appendChild(manualQuantityCell);

                table.appendChild(tableRow);
                validDataFound = true;
            });

            if (validDataFound) {
                inventoryContainer.appendChild(table);

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const resetButton = document.createElement('button');
                resetButton.id = 'reset';
                resetButton.textContent = 'Reset';
                buttonContainer.appendChild(resetButton);

                const sendButton = document.createElement('button');
                sendButton.id = 'send';
                sendButton.textContent = 'Send Inventory Count';
                buttonContainer.appendChild(sendButton);

                inventoryContainer.appendChild(buttonContainer);

                resetButton.addEventListener('click', () => {
                    clearCookies();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                        location.reload();
                    }, 700);
                });

                sendButton.addEventListener('click', () => {
                    try {
                        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
                        const shopName = parsedData.find(item => item["Inventory By Shop"]?.startsWith('Locations:'))
                            ?.[ "Inventory By Shop"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop';

                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.json_to_sheet(Array.from(tableRows.values()), { header: headers });
                        worksheet['!cols'] = [
                            { wch: 50 },
                            { wch: 15 },
                            { wch: 20 }
                        ];
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
                        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                        const fileName = `${shopName}_Inventory_Count_${currentDate}.xlsx`;
                        const fileUrl = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = fileUrl;
                        downloadLink.download = fileName;
                        downloadLink.click();

                        clearCookies();

                        setTimeout(() => {
                            const email = 'michael@kadingproperties.com';
                            const emailType = "Inventory";
                            const subject = `${shopName.replace(/_/g, ' ')} | ${emailType} Count | ${currentDate}`;
                            const body = `
                            Hello,

                            Attached is the ${emailType.toLowerCase()} count file for ${shopName.replace(/_/g, ' ')}. This file was generated on ${currentDate}.
                            Please find the Excel document attached.

                            Note: This is an automatic email sent from Inventory Verification.
                            Visit: https://adminkading.github.io/Inventory-Verification/

                            Best regards,
${shopName.replace(/_/g, ' ')}
                            `.trim();

                            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.location.href = mailtoLink;

                            alert('Email prepared. Please attach the downloaded Excel file before sending.');
                        }, 500);
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
