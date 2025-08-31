document.addEventListener('DOMContentLoaded', () => {
    // HTML elemanlarını seç
    const themeSelector = document.getElementById('themeSelector');
    const body = document.body;

    // localStorage'daki tema tercihini uygula
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    };

    // Sayfa yüklendiğinde tema tercihini localStorage'dan al ve uygula
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        themeSelector.value = savedTheme; // Combobox'ı doğru değere ayarla
    } else {
        // Eğer localStorage'da bir tercih yoksa varsayılanı kullan (açık tema)
        applyTheme('light');
        themeSelector.value = 'light';
    }

    // Combobox değeri değiştiğinde temayı güncelle
    themeSelector.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        localStorage.setItem('theme', selectedTheme); // Yeni tercihi kaydet
        applyTheme(selectedTheme);
    });

    // Sayfalar arası geçişte localStorage değişikliğini dinle
    window.addEventListener('storage', () => {
        const newTheme = localStorage.getItem('theme');
        applyTheme(newTheme);
        themeSelector.value = newTheme;
    });
});