export function sendToGoogleDrive(blob, fileName) {
    const reader = new FileReader();

    reader.onload = () => {
        const base64Data = reader.result.split(',')[1];

        const formData = new URLSearchParams();
        formData.append('filename', fileName);
        formData.append('contents', base64Data);

        fetch('https://script.google.com/macros/s/AKfycbxshD-YHmYP6s63cLnwA2aK90O_rBMaM9FQCg6MdQw8a5rPyoYv7I9HCIQyYDEHVGW8pw/exec', {
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
