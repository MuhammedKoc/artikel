document.addEventListener('DOMContentLoaded', function() {

    // URL'den uygulama adını al
    const params = new URLSearchParams(window.location.search);
    const appName = params.get('app');

    const appContentDiv = document.getElementById('app-content');
    const appTitleH2 = document.getElementById('app-title');

    // Uygulama adlarına göre başlıkları belirle
    const appTitles = {
        'ekmek': 'Ekmek Sayım',
        'tavuk': 'Tavuk Sayım'
        // Diğer uygulamaları buraya ekleyebilirsin
    };

    if (appName) {
        // Doğru uygulama adını ve dosya yolunu belirle
        const appFileName = `${appName}-app.html`;
        const appPageTitle = appTitles[appName] || 'Uygulama';

        // Sayfa başlığını güncelle
        document.title = `Artikel - ${appPageTitle}`;
        appTitleH2.textContent = appPageTitle;
        
        // İçeriği sunucudan çek ve yükle
        fetch(appFileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Uygulama içeriği yüklenemedi: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                appContentDiv.innerHTML = html;
            })
            .catch(error => {
                console.error('Uygulama içeriği yüklenirken bir hata oluştu:', error);
                appContentDiv.innerHTML = `<p>Hata: Uygulama içeriği yüklenemedi.</p>`;
            });
    } else {
        // Eğer URL'de bir uygulama belirtilmemişse
        appContentDiv.innerHTML = `<p>Lütfen bir uygulama seçin.</p>`;
        appTitleH2.textContent = 'Uygulama Seçimi';
    }
});