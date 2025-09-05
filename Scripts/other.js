document.addEventListener('DOMContentLoaded', () => {
    // Tema değiştirme işlevi
    const themeSelector = document.getElementById('themeSelector');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        if (themeSelector) {
            themeSelector.value = savedTheme;
        }
    } else {
        applyTheme('light');
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (event) => {
            const selectedTheme = event.target.value;
            localStorage.setItem('theme', selectedTheme);
            applyTheme(selectedTheme);
        });
    }

    // Çıkış yapma işlevi
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = './auth.html';
        });
    }
});