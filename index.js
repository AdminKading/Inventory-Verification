document.querySelectorAll('.container button').forEach(button => {
    button.addEventListener('click', async (event) => {
        const shopName = event.target.getAttribute('data-shop');

        if (shopName) {
            const fileName = `Shop Files/${shopName.toLowerCase().replace(/\s+/g, '_')}.xlsx`;


            try {
                // Fetch the file from the server
                const response = await fetch(fileName);

                if (!response.ok) {
                    throw new Error(`File not found: ${fileName}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

                // Read the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                console.log('Excel Data:', jsonData);


                // Save the data to localStorage and redirect
                localStorage.setItem('excelData', JSON.stringify(jsonData));
                window.location.href = '/Home/home.html';
            } catch (error) {
                console.error(error);
                alert(`Error loading file: ${error.message}`);
            }
        } else {
            alert('Error: Shop name not found.');
        }
    });
});
