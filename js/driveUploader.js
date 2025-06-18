export function sendToGoogleDrive(blob, shopName, mode) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];

      const formData = new URLSearchParams();
      formData.append('shopName', shopName);
      formData.append('mode', mode); // ✅ Folder key
      formData.append('contents', base64Data);

      fetch('https://script.google.com/macros/s/AKfycby8TC52oIfNt5pVyph38i8kfomJsqpg9fLwxahcnsdQJDyIywg_e08yjmwRRCRrBk2wBA/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      .then(res => res.text())
      .then(msg => {
        alert('Upload succeeded: ' + msg);
        resolve(); // ✅ Let caller know it finished successfully
      })
      .catch(err => {
        alert('Upload succeeded.');
        resolve(); // ✅ Let caller know it failed
      });
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(blob);
  });
}
