window.onload = () => {
    // Add event listener to Exit button
    const exitButton = document.getElementById('exit');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // Redirect to index.html
        });
    }
};

