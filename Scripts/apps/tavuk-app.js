// HTML elementlerini seç
const copyButton = document.getElementById('copy-button');
const shareButton = document.getElementById('share-button');

// Uzun adlar ile kısa adlar arasındaki eşleşmeyi ve sıralamayı tanımla
const tavukProducts = [
    { long: 'baget', short: 'BAGET' },
    { long: 'corbalik', short: 'ÇORBALIK' },
    { long: 'kalcaliBut', short: 'KALÇALI BUT' },
    { long: 'ustKanat', short: 'ÜST KANAT' },
    { long: 'kanatIzgara', short: 'KANAT' },
    { long: 'pirzola', short: 'PİRZOLA' },
    { long: 'pilicBonfile', short: 'BONFİLE' },
    { long: 'izgaraTava', short: 'IZGARA TAVA' },
    { long: 'butIncik', short: 'İNCİK' },
    { long: 'bagetLale', short: 'LALE' },
    { long: 'pirzolaKelebek', short: 'KELEBEK' },
    { long: 'parmakBonfile', short: 'PARMAK BONFİLE' },
    { long: 'ciger', short: 'CİĞER' },
    { long: 'butunPoset', short: 'BÜTÜN POŞET' },
    { long: 'butunGogus', short: 'BÜTÜN GÖĞÜS' },
    { long: 'kiyma', short: 'KIYMA' },
    { long: 'kusbasi', short: 'KUŞBAŞI' },
    { long: 'tasKebap', short: 'TAS KEBAP' },
    { long: 'sote', short: 'SOTE' },
    { long: 'inegolKofte', short: 'İNEGÖL KÖFTE' },
    { long: 'izgaraKofte', short: 'IZGARA KÖFTE' },
    { long: 'firinlik', short: 'FIRINLIK' },
    { long: 'izgaraMangal', short: 'IZGARA MANGAL' },
    { long: 'sosluKokKanat', short: 'SOSLU KANAT' },
    { long: 'sosluPirzola', short: 'SOSLU PİRZOLA' },
    { long: 'kuruKofte', short: 'KURU KÖFTE' },
    { long: 'satirKofte', short: 'SATIR KÖFTE' }
];

// Tüm form inputlarını seç
const tavukInputs = document.querySelectorAll('.app-form input[type="text"]');

function generateTavukList() {
    let list = [];
    tavukProducts.forEach(product => {
        const input = document.getElementById(product.long);
        const count = input ? parseInt(input.value, 10) : 0;
        
        // Değeri 0 olsa bile listeye ekle
        list.push(`${product.short}: ${count}`);
    });
    return list.join('\n');
}

// Kopyala butonu için olay dinleyici
copyButton.addEventListener('click', function() {
    const tavukList = generateTavukList();
    
    if (tavukList) {
        navigator.clipboard.writeText(tavukList)
            .then(() => {})
            .catch(err => {
                console.error('Kopyalama işlemi başarısız oldu: ', err);
            });
    }
});

// Paylaş butonu için olay dinleyici
shareButton.addEventListener('click', function() {
    const tavukList = generateTavukList();
    
    if (navigator.share) {
        if (tavukList) {
            navigator.share({
                title: 'Günlük Tavuk Sayım',
                text: tavukList
            })
            .then(() => {
                console.log('Liste başarıyla paylaşıldı.');
            })
            .catch(err => {
                console.error('Paylaşım işlemi iptal edildi veya başarısız oldu: ', err);
            });
        }
    } else {
        alert('Paylaşım özelliği tarayıcınız tarafından desteklenmiyor.');
    }
});

// Tüm form inputlarının bulunduğu satırlara tıklama özelliği ekle
tavukInputs.forEach(input => {
    const parentDiv = input.closest('.form-group');
    if (parentDiv) {
        parentDiv.addEventListener('click', function() {
            input.focus();
            setTimeout(() => {
                input.setSelectionRange(input.value.length, input.value.length);
            }, 0);
        });
    }
});

// Inputa doğrudan tıklama olayını engelle
tavukInputs.forEach(input => {
    // Input'a doğrudan tıklandığında imlecin pozisyonunu kontrol et
    input.addEventListener('mousedown', function(e) {
        // Varsayılan tıklama davranışını durdur
        e.preventDefault();
        
        // Input'u manuel olarak odakla
        this.focus();
        
        // İmleci metnin en sonuna taşı
        setTimeout(() => {
            this.setSelectionRange(this.value.length, this.value.length);
        }, 1);
    });

    // Satırın tamamına tıklama olayını dinle
    const parentDiv = input.closest('.form-group');
    if (parentDiv) {
        parentDiv.addEventListener('click', function() {
            input.focus();
            setTimeout(() => {
                input.setSelectionRange(input.value.length, input.value.length);
            }, 1);
        });
    }
});