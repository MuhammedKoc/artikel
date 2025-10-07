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
    
    // Görünüm elemanları
    const tableView = document.getElementById('tableView'); 
    const gridView = document.getElementById('gridView');   
    const viewToggle = document.getElementById('viewToggle'); 
    // Önceden kullanılan tableViewLabel ve gridViewLabel kaldırılmıştır.
    

    const urunlerPerPage = 50;
    let tumVeriler = [];
    let filtrelenmisVeriler = [];
    let currentPage = 1;
    let currentView = 'table'; // Varsayılan görünümü 'grid' (Galeri) olarak ayarla

    // Türkçe karakter normalizasyon fonksiyonu (SADELEŞTİRİLDİ)
    function normalizeTurkishCharsAndLowercase(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        // Tarih uyarısını gidermek için sadece küçük harfe çevirme kullanıldı.
        return text.toLocaleLowerCase('tr-TR');
    }

    // Tarih çözümleme için Türkçe ay adları
    const turkishMonths = {
        "ocak": 0, "şubat": 1, "mart": 2, "nisan": 3, "mayıs": 4, "haziran": 5,
        "temmuz": 6, "ağustos": 7, "eylül": 8, "ekim": 9, "kasım": 10, "aralık": 11,
        "oc": 0, "şub": 1, "mar": 2, "nis": 3, "may": 4, "haz": 5,
        "tem": 6, "ağu": 7, "eyl": 8, "eki": 9, "kas": 10, "ara": 11
    };

    // TARİH ÇÖZÜMLEME FONKSİYONU GÜNCELLEMELERİ
    function parseTurkishDate(dateString) {
        if (!dateString) return null;
        
        dateString = dateString.trim(); 

        // 1. Format: YYYY-MM-DD
        const yyyyMmDdMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (yyyyMmDdMatch) {
            return new Date(parseInt(yyyyMmDdMatch[1], 10), parseInt(yyyyMmDdMatch[2], 10) - 1, parseInt(yyyyMmDdMatch[3], 10));
        }

        // 2. Format: DD Ay YYYY veya DD Ay (örn: 02 Mayıs, 30 Mayıs 2024)
        const ddAyYyyyMatch = dateString.match(/^(\d{1,2})\s+([a-zA-ZçÇğĞıİöÖşŞüÜ]+)(?:\s+(\d{4}))?$/);
        
        if (ddAyYyyyMatch) {
            const day = parseInt(ddAyYyyyMatch[1], 10);
            const monthName = normalizeTurkishCharsAndLowercase(ddAyYyyyMatch[2]);
            const month = turkishMonths[monthName];
            const year = ddAyYyyyMatch[3] ? parseInt(ddAyYyyyMatch[3], 10) : new Date().getFullYear();

            if (month !== undefined) {
                // Tarih nesnesini döndürür
                return new Date(year, month, day);
            }
        }

        console.warn(`[Tarih Uyarısı] Geçersiz veya bilinmeyen tarih formatı: "${dateString}"`);
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
            
            // Toggle durumunu varsayılan görünüme göre ayarla (index.html'de checked=true ise 'grid' dir)
            currentView = viewToggle.checked ? 'grid' : 'table';
            renderView(); 
        } catch (error) {
            // Hata mesajını daha anlaşılır hale getirdik
            console.error(`Veri çekme hatası: ${error.name}: ${error.message}`);
            tabloGovdesi.innerHTML = '<tr><td colspan="3">Veriler yüklenirken bir hata oluştu.</td></tr>';
        }
    }

    // Mevcut görünüme göre render eden ana fonksiyon
    function renderView() {
        updateViewClasses();

        if (currentView === 'table') {
            renderTableWithPagination();
        } else {
            renderGridWithPagination();
        }
    }

    // Görünüm sınıflarını güncelleyen fonksiyon
    function updateViewClasses() {
        // Kontrol kutusunun durumuna göre currentView'i ayarla
        currentView = viewToggle.checked ? 'table' : 'grid';

        if (currentView === 'table') { 
            tableView.classList.add('active-view');
            gridView.classList.remove('active-view');
        } else {
            tableView.classList.remove('active-view');
            gridView.classList.add('active-view');
        }
        // Gerekirse CSS'te görünüm düğmelerinin rengini ayarlayan kod burada olmalı.
    }

    // Akordiyon Yöneticisi Değişkeni (SADECE BİR DETAY AÇIK KALMASINI SAĞLAR)
    let openDetailRow = null; 

    // Akordiyonu açıp kapatan ana fonksiyon (SADELEŞTİRİLDİ)
    function toggleDetail(detailRow) {
        if (detailRow.classList.contains('open')) {
            // Kapatma işlemi
            detailRow.classList.remove('open');
            openDetailRow = null;
        } else {
            // Açma işlemi (ve diğerini kapatma)
            if (openDetailRow) {
                openDetailRow.classList.remove('open');
            }
            
            detailRow.classList.add('open');
            openDetailRow = detailRow;
        }
    }

    // Tablo görünümünü render eden fonksiyon
    function renderTableWithPagination() {
    const startIndex = (currentPage - 1) * urunlerPerPage;
    const urunlerToDisplay = filtrelenmisVeriler.slice(startIndex, startIndex + urunlerPerPage);

    tabloGovdesi.innerHTML = '';
    // Sayfa değiştiğinde açık olan satırı sıfırla
    openDetailRow = null; 

    if (urunlerToDisplay.length === 0 && filtrelenmisVeriler.length === 0) {
        tabloGovdesi.innerHTML = '<tr><td colspan="3">Hiç sonuç bulunamadı.</td></tr>';
        updatePaginationControls();
        return;
    }

    if (urunlerToDisplay.length === 0 && currentPage > 1) {
        currentPage--;
        renderTableWithPagination();
        return;
    }

    urunlerToDisplay.forEach((veri) => {
        // 1. Ana Satır (Tıklanabilir Başlık)
        const mainRow = document.createElement('tr');
        mainRow.classList.add('product-row-main');

        // index.html'deki tablo başlıklarına göre 5. sütun (AFİŞ) kaldırıldığı için 3 sütun kaldı.
        mainRow.innerHTML = `
            <td>${veri.urunAdi}</td>
            <td>${veri.kod}</td>
            <td class="action-cell">
                <a href="afisler/${veri.kaynakResim}"
                   class="poster-button"
                   data-pswp-width="600" data-pswp-height="900" 
                   target="_blank"
                   onclick="event.stopPropagation()"> AFİŞİ GÖSTER
                </a>
            </td>
        `;
        tabloGovdesi.appendChild(mainRow);

        // 2. Detay Satırı (Açılıp Kapanacak İçerik)
        const detailRow = document.createElement('tr');
        detailRow.classList.add('product-row-details');
        
        // colspan="3" kullanılmalı çünkü tablonun sadece 3 ana sütunu var.
        detailRow.innerHTML = `
            <td colspan="3">
                <div class="product-details-content">
                    <p>Fiyat: <strong>${veri.fiyat}</strong></p>
                    <p>Geldiği Tarih: <strong>${veri.geldigiTarih}</strong></p>
                </div>
            </td>
        `;
        tabloGovdesi.appendChild(detailRow);

        // Ana satır tıklama olayını ekle:
        mainRow.addEventListener('click', function() {
            toggleDetail(detailRow); 
        });
    });

    updatePaginationControls();
    
    // PhotoSwipe lightbox'ı her render işleminden sonra yeniden başlat
    if (typeof PhotoSwipeLightbox !== 'undefined') {
        const lightbox = new PhotoSwipeLightbox({
            gallery: '#tabloGovdesi',
            children: '.poster-button', 
            pswpModule: window.PhotoSwipe
        });
        lightbox.init();
    }
}


    // Galeri (Grid) görünümünü render eden fonksiyon (Canvas ile güncellendi)
    function renderGridWithPagination() {
        const startIndex = (currentPage - 1) * urunlerPerPage;
        const endIndex = startIndex + urunlerPerPage;
        const urunlerToDisplay = filtrelenmisVeriler.slice(startIndex, endIndex);

        gridView.innerHTML = '';

        if (urunlerToDisplay.length === 0 && filtrelenmisVeriler.length === 0) {
            gridView.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Hiç sonuç bulunamadı.</p>';
            updatePaginationControls();
            return;
        }
        
        if (urunlerToDisplay.length === 0 && currentPage > 1) {
            currentPage--;
            renderGridWithPagination();
            return;
        }

        urunlerToDisplay.forEach(veri => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            let imageLink = null; 
            const kaynakResim = `afisler/${veri.kaynakResim}`; 

            imageLink = document.createElement('a');
            imageLink.href = kaynakResim;
            imageLink.classList.add('card-image-placeholder'); 
            imageLink.setAttribute('data-pswp-width', '600'); 
            imageLink.setAttribute('data-pswp-height', '900'); 
            imageLink.setAttribute('target', '_blank');


            if (veri.koordinatlar && veri.kaynakResim) {
                imageLink.classList.add('has-image');
                
                const canvas = document.createElement('canvas');
                imageLink.appendChild(canvas);
                
                const { x1, y1, x2, y2 } = veri.koordinatlar;

                const img = new Image();
                img.crossOrigin = "Anonymous"; 
                img.onload = function() {
                    const ctx = canvas.getContext('2d');
                    
                    const sourceW = x2 - x1;
                    const sourceH = y2 - y1;
                    
                    canvas.width = sourceW;
                    canvas.height = sourceH;
                    
                    ctx.drawImage(
                        img, 
                        x1, y1,       
                        sourceW, sourceH, 
                        0, 0,          
                        sourceW, sourceH  
                    );
                    
                    canvas.classList.add('loaded');
                };
                img.onerror = function() {
                    imageLink.classList.remove('has-image');
                };
                img.src = kaynakResim;

            } else {
                imageLink.style.paddingTop = '100%'; 
            }

            card.appendChild(imageLink);

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('card-details');
            detailsDiv.innerHTML = `
                <h4>${veri.urunAdi}</h4>
                <p>Kod: ${veri.kod}</p>
                <p>Tarih: ${veri.geldigiTarih}</p>
            `;
            card.appendChild(detailsDiv);
            
            gridView.appendChild(card);
        });

        updatePaginationControls();

        if (typeof PhotoSwipeLightbox !== 'undefined') {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '#gridView',
                children: 'a',
                pswpModule: window.PhotoSwipe
            });
            lightbox.init();
        }
    }

    // Sayfalama kontrollerini güncelleyen fonksiyon
    function updatePaginationControls() {
        const totalPages = Math.ceil(filtrelenmisVeriler.length / urunlerPerPage);

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        pageInfoSpan.textContent = `Sayfa ${totalPages === 0 ? 0 : currentPage} / ${totalPages}`;
    }
    
    // Görünüm değiştirme toggle olayı
    viewToggle.addEventListener('change', function() {
        currentView = this.checked ? 'table' : 'grid';
        currentPage = 1; 
        renderView();
    });

    // Arama çubuğu olayı
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
        renderView(); 
    });

    // Sayfalama olayları
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderView();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filtrelenmisVeriler.length / urunlerPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderView();
        }
    });

    // Sayfa yüklendiğinde verileri çekmeye başla
    verileriGetir();
});