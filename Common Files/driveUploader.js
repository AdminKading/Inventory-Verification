export function sendToGoogleDrive(blob, fileName) {
    const reader = new FileReader();

    reader.onload = () => {
        const base64Data = reader.result.split(',')[1];

        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('filename', fileName);
        formData.append('contents', base64Data);

        fetch('https://script.google.com/macros/s/AKfycbzdhKlsbZBhir118EL4jyj35BFbsEG38XcYVXbgEMiImzExCbWk3BDt8sKnNpBjt_81LA/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => alert('Upload failed: ' + err));
    };

    reader.readAsDataURL(blob); // Convert blob to base64
}
