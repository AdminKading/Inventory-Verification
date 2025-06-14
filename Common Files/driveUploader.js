export function sendToGoogleDrive(blob, fileName) {
    const reader = new FileReader();

    reader.onload = () => {
        const base64Data = reader.result.split(',')[1];

        fetch('https://script.google.com/macros/s/AKfycbyJqtnj4vPpNR0ILuAt5AykvAO1f0pciB8_BEDYmZqdQRH4vBdzbRZpepv-yPdCSoj0Xg/exec', { // ← Replace with your script URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            body: base64Data
        })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => alert('Upload failed: ' + err));
    };

    reader.readAsDataURL(blob); // Convert blob to base64
}
