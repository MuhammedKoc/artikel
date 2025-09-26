document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    
    // HTML elemanlarını seç
    const aramaCubugu = document.getElementById('aramaCubugu');
    const tabloGovdesi = document.getElementById('tabloGovdesi');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfoSpan = document.getElementById('pageInfo');
    const posterModal = document.getElementById('posterModal');
    const modalPosterImage = document.getElementById('modalPosterImage');
    const zoomContainer = document.querySelector('.zoom-container');

    const urunlerPerPage = 50;
    let tumVeriler = [];
    let filtrelenmisVeriler = [];
    let currentPage = 1;

    // Türkçe karakter normalizasyon fonksiyonu
    function normalizeTurkishCharsAndLowercase(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        let normalizedText = text.toLocaleLowerCase('tr-TR');
        normalizedText = normalizedText
            .replace(/i̇/g, 'i')
            .replace(/ı/g, 'i');
        return normalizedText;
    }

    const turkishMonths = {
        "ocak": 0, "şubat": 1, "mart": 2, "nisan": 3, "mayıs": 4, "haziran": 5,
        "temmuz": 6, "ağustos": 7, "eylül": 8, "ekim": 9, "kasım": 10, "aralık": 11,
        "oc": 0, "şub": 1, "mar": 2, "nis": 3, "may": 4, "haz": 5,
        "tem": 6, "ağu": 7, "eyl": 8, "eki": 9, "kas": 10, "ara": 11
    };

    function parseTurkishDate(dateString) {
        if (!dateString) return null;

        const yyyyMmDdMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (yyyyMmDdMatch) {
            return new Date(parseInt(yyyyMmDdMatch[1]), parseInt(yyyyMmDdMatch[2]) - 1, parseInt(yyyyMmDdMatch[3]));
        }

        const ddAyYyyyMatch = dateString.match(/^(\d{1,2})\s+([a-zA-ZçÇğĞıİöÖşŞüÜ]+)(?:\s+(\d{4}))?$/);
        if (ddAyYyyyMatch) {
            const day = parseInt(ddAyYyyyMatch[1]);
            const monthName = normalizeTurkishCharsAndLowercase(ddAyYyyyMatch[2]);
            const month = turkishMonths[monthName];
            const year = ddAyYyyyMatch[3] ? parseInt(ddAyYyyyMatch[3]) : new Date().getFullYear();

            if (month !== undefined) {
                return new Date(year, month, day);
            }
        }

        console.warn(`Geçersiz veya bilinmeyen tarih formatı: ${dateString}`);
        return null;
    }

    function compareDates(a, b) {
        const dateA = parseTurkishDate(a.geldigiTarih);
        const dateB = parseTurkishDate(b.geldigiTarih);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB.getTime() - dateA.getTime();
    }

    // Veri çekme ve işleme fonksiyonu
    async function verileriGetir() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP hata! Durum: ${response.status}`);
            }
            tumVeriler = await response.json();
            tumVeriler.sort(compareDates);
            filtrelenmisVeriler = [...tumVeriler];
            renderTableWithPagination();
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            tabloGovdesi.innerHTML = '<tr><td colspan="5">Veriler yüklenirken bir hata oluştu.</td></tr>';
        }
    }

    // PhotoSwipe'ı çalıştırmak için butonu <a> etiketine dönüştür
    function renderTableWithPagination() {
        const startIndex = (currentPage - 1) * urunlerPerPage;
        const endIndex = startIndex + urunlerPerPage;
        const urunlerToDisplay = filtrelenmisVeriler.slice(startIndex, endIndex);

        tabloGovdesi.innerHTML = '';

        if (urunlerToDisplay.length === 0 && filtrelenmisVeriler.length === 0) {
            tabloGovdesi.innerHTML = '<tr><td colspan="5">Hiç sonuç bulunamadı.</td></tr>';
            updatePaginationControls();
            return;
        }

        if (urunlerToDisplay.length === 0 && currentPage > 1) {
            currentPage--;
            renderTableWithPagination();
            return;
        }

        urunlerToDisplay.forEach(veri => {
            const satir = document.createElement('tr');
            // PhotoSwipe için <a> etiketi kullanıldı
            satir.innerHTML = `
                <td>${veri.urunAdi}</td>
                <td>${veri.kod}</td>
                <td>${veri.fiyat}</td>
                <td>${veri.geldigiTarih}</td>
                <td>
                    <a href="afisler/${veri.kaynakResim}"
                       class="poster-button"
                       target="_blank">
                       AFİŞİ GÖSTER
                    </a>
                </td>
            `;
            tabloGovdesi.appendChild(satir);
        });

        updatePaginationControls();
        
        // PhotoSwipe lightbox'ı her render işleminden sonra yeniden başlat
        if (typeof PhotoSwipeLightbox !== 'undefined') {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '#tabloGovdesi',
                children: 'a',
                pswpModule: window.PhotoSwipe
            });
            lightbox.init();
        }
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(filtrelenmisVeriler.length / urunlerPerPage);

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        pageInfoSpan.textContent = `Sayfa ${totalPages === 0 ? 0 : currentPage} / ${totalPages}`;
    }

    // Afiş modalını açma fonksiyonu artık PhotoSwipe tarafından yönetiliyor
    window.acAfisModal = function(resimAdi) {
        // Bu fonksiyon artık kullanılmıyor, ancak eski çağrıları desteklemek için burada bırakıldı.
        // PhotoSwipe galeriyi direkt olarak <a> etiketlerinden başlatacaktır.
        console.log(`Afis: ${resimAdi} PhotoSwipe tarafından gösteriliyor.`);
    };

    // Afiş modalını kapatma fonksiyonu da artık kullanılmıyor
    window.kapatAfisModal = function() {
        // Bu fonksiyon da artık kullanılmıyor.
    };

    aramaCubugu.addEventListener('input', function() {
        const aramaMetni = normalizeTurkishCharsAndLowercase(aramaCubugu.value);

        if (aramaMetni === "") {
            filtrelenmisVeriler = [...tumVeriler];
        } else {
            filtrelenmisVeriler = tumVeriler.filter(veri => {
                const urunAdiNormalized = normalizeTurkishCharsAndLowercase(veri.urunAdi || '');
                const kodNormalized = normalizeTurkishCharsAndLowercase(veri.kod || '');
                const tarihNormalized = normalizeTurkishCharsAndLowercase(veri.geldigiTarih || '');
                const linkNormalized = normalizeTurkishCharsAndLowercase(veri.link || '');
                const fiyatNormalized = normalizeTurkishCharsAndLowercase(veri.fiyat || '');

                return urunAdiNormalized.includes(aramaMetni) ||
                       kodNormalized.includes(aramaMetni) ||
                       tarihNormalized.includes(aramaMetni) ||
                       linkNormalized.includes(aramaMetni) ||
                       fiyatNormalized.includes(aramaMetni);
            });
        }

        currentPage = 1;
        renderTableWithPagination();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTableWithPagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filtrelenmisVeriler.length / urunlerPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTableWithPagination();
        }
    });

    // Sayfa yüklendiğinde verileri çekmeye başla
    verileriGetir();
});