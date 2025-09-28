// Shop buttons for loading Excel from Google Drive (exclude upload buttons)
document.querySelectorAll('.container button[data-shop]:not(.upload-btn)').forEach(button => {
  button.addEventListener('click', async (event) => {
    const shopName = event.target.getAttribute('data-shop');
    if (!shopName) {
      alert('Error: Shop name not found.');
      return;
    }

    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVpNVILkwnbN3ajlUPFSUSITudIIsL83CHgIRJh6TEOc6rI53qj7h4jtaPRLrfCbfteA/exec';
    const fileParam = encodeURIComponent(shopName + '.xlsx');
    const url = `${APPS_SCRIPT_URL}?filename=${fileParam}&mode=main&callback=handleShopExcel`;

    window.handleShopExcel = (response) => {
      if (response.error) {
        console.error(response.error);
        alert(`Error loading file: ${response.error}`);
        return;
      }

      try {
        const base64 = response.base64;
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const workbook = XLSX.read(bytes, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        console.log('Excel Data:', jsonData);

        localStorage.setItem('excelData', JSON.stringify(jsonData));
        localStorage.setItem('shopFile', shopName + '.xlsx');

        window.location.href = 'html/home.html';
      } catch (err) {
        console.error(err);
        alert(`Error parsing Excel file: ${err.message}`);
      } finally {
        delete window.handleShopExcel;
      }
    };

    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  });
});

// Admin-only upload buttons
const fileInput = document.getElementById('file-input');

document.querySelectorAll('.upload-btn').forEach(uploadBtn => {
  // Only show if admin
  if (window.hasAdminAccess && window.hasAdminAccess()) {
    uploadBtn.style.display = 'inline-block';
  }

  uploadBtn.addEventListener('click', () => {
    const shopName = uploadBtn.getAttribute('data-shop');
    console.log(`Upload clicked for ${shopName}`);
    fileInput.value = ''; // Reset file input
    fileInput.click();

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      console.log(`File selected for ${shopName}:`, file.name);

      const arrayBuffer = await file.arrayBuffer();
      const base64Contents = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // POST file to Apps Script
      const APPS_SCRIPT_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxKYky_aPAF-kzB8lHlBUAM6DbSV7wKSGXsD1052XYQM1j6RdeNr4HPO9d7SGexYnjc7w/exec';

      try {
        await fetch(APPS_SCRIPT_UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `shopName=${encodeURIComponent(shopName)}&uploadType=shop&contents=${encodeURIComponent(base64Contents)}`
        });
        // Ignore fetch errors from CORS
      } catch (err) {
        console.warn('Fetch may fail due to CORS, ignoring in UI', err);
      }

      // Always show success message to user
      console.log(`Upload request sent for ${shopName}`);
      alert(`File uploaded for ${shopName}`);
    };
  });
});
