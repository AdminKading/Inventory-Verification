export function sendToGoogleDrive(blob, fileName) {
    const reader = new FileReader();

    reader.onload = () => {
        const base64Data = reader.result.split(',')[1];

        fetch('https://script.google.com/macros/s/AKfycbybB2ERdFs4UMg1wQCYYoq_CPo35gbWqdZ3B8HMi_QurN09R8GJ3c1QfWQdw0-9AUk8-g/exec', { // ← Replace with your script URL
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
