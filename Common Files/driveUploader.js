export function sendToGoogleDrive(blob, fileName) {
    const reader = new FileReader();

    reader.onload = () => {
        const base64Data = reader.result.split(',')[1];

        const formData = new URLSearchParams();
        formData.append('filename', fileName);
        formData.append('contents', base64Data);

        fetch('https://script.google.com/macros/s/AKfycbyroNBuMDq9SBL4LWG6h729qD6j_d5YhBtmfVAsB_wsL5tUgwSkzWguAy2wOicqUyaG7Q/exec', {
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

    reader.readAsDataURL(blob);
}
