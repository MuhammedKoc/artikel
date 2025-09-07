document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const appName = params.get('app');
    const appContentDiv = document.getElementById('app-content');
    const appTitleH2 = document.getElementById('app-title');

    const appTitles = {
        'ekmek': 'Ekmek Sayım',
        'tavuk': 'Tavuk Sayım'
        // Diğer uygulamaları buraya ekleyebilirsin
    };

    if (appName) {
        const appFileName = `../Pages/${appName}-app.html`;
        const scriptFileName = `../Scripts/${appName}-app.js`;
        const appPageTitle = appTitles[appName] || 'Uygulama';

        document.title = `Artikel - ${appPageTitle}`;
        appTitleH2.textContent = appPageTitle;
        
        // Uygulama HTML içeriğini yükle
        fetch(appFileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Uygulama içeriği yüklenemedi: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // İçeriği sayfaya yerleştir
                appContentDiv.innerHTML = html;
                
                // İçerik yüklendikten sonra ilgili JavaScript dosyasını sayfaya ekle
                const script = document.createElement('script');
                script.src = scriptFileName;
                document.body.appendChild(script);
            })
            .catch(error => {
                console.error('Uygulama içeriği yüklenirken bir hata oluştu:', error);
                appContentDiv.innerHTML = `<p>Hata: Uygulama içeriği yüklenemedi.</p>`;
            });
    } else {
        appContentDiv.innerHTML = `<p>Lütfen bir uygulama seçin.</p>`;
        appTitleH2.textContent = 'Uygulama Seçimi';
    }
});