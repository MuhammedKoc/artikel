    // HTML elementlerini seç
const copyButton = document.getElementById('copy-button');
const shareButton = document.getElementById('share-button');

// Tüm form inputlarını seç
const ekmekInputs = document.querySelectorAll('.app-form input[type="number"]');

function generateEkmekList() {
    let list = [];
    ekmekInputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`).textContent;
        const count = parseInt(input.value, 10);
        
        // Sadece değeri 0'dan büyük olanları listeye ekle
        if (count > 0) {
            list.push(`${label} ${count} Adet`);
        }
    });
    return list.join('\n');
}

// Kopyala butonu için olay dinleyici
copyButton.addEventListener('click', function() {
    const ekmekList = generateEkmekList();

    
    
    if (ekmekList) {
        // Navigator API ile panoya kopyala
        navigator.clipboard.writeText(ekmekList)
            .then(() => {
                
            })
            .catch(err => {
                console.error('Kopyalama işlemi başarısız oldu: ', err);
            });
    } else {
        navigator.clipboard.writeText("İade Ekmek Yok");
    }
});

// Paylaş butonu için olay dinleyici
shareButton.addEventListener('click', function() {
    const ekmekList = generateEkmekList();
    
    // Web Share API'sinin desteklenip desteklenmediğini kontrol et
    if (navigator.share) {
        if (ekmekList) {
            navigator.share({
                title: 'Günlük Ekmek Sayım',
                text: ekmekList
            })
            .then(() => {
                console.log('Liste başarıyla paylaşıldı.');
            })
            .catch(err => {
                console.error('Paylaşım işlemi iptal edildi veya başarısız oldu: ', err);
            });
        } else {
            alert('Paylaşılacak bir ürün bulunmamaktadır.');
        }
    } else {
        // API desteklenmiyorsa bir yedek mesaj göster
        alert('Paylaşım özelliği tarayıcınız tarafından desteklenmiyor. Listeyi manuel olarak kopyalayabilirsiniz.');
    }
});

ekmekInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.select();
    });
});