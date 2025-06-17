export function sendToGoogleDrive(blob, shopName, mode) {
  const reader = new FileReader();

  reader.onload = () => {
    const base64Data = reader.result.split(',')[1];

    const formData = new URLSearchParams();
    // Don't send filename, server generates full filename
    formData.append('shopName', shopName);
    formData.append('mode', mode);
    formData.append('contents', base64Data);

    fetch('https://script.google.com/macros/s/AKfycby8TC52oIfNt5pVyph38i8kfomJsqpg9fLwxahcnsdQJDyIywg_e08yjmwRRCRrBk2wBA/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
    .then(res => res.text())
    .then(msg => alert('Upload succeeded: ' + msg))
    .catch(err => alert('Upload failed: ' + err.message));
  };

  reader.readAsDataURL(blob);
}
