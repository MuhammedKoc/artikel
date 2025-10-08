document.addEventListener('DOMContentLoaded', () => {
    const monthTitle = document.querySelector('.month-title');
    const calendarSlider = document.querySelector('.calendar-slider');
    const calendarPages = document.querySelectorAll('.calendar-page');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    const posterDisplay = document.querySelector('.poster-display');
    
    // Eski tam ekran değişkenleri temizlendi
    // const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    // const fullscreenImage = document.getElementById('fullscreen-image');
    
    const monthSelector = document.querySelector('.month-selector');
    const monthDropdown = document.getElementById('month-dropdown');

    let posterLookup = {};
    let currentDate = new Date();
    let currentMonthIndex = currentDate.getMonth();
    let isSwiping = false;
    let touchStartX = 0;
    let touchCurrentX = 0;
    let touchMoved = false;

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    
    // *** YENİ: Boyut Alma Fonksiyonu ***
    function getImageDimensions(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = () => {
                console.warn(`Görsel yüklenemedi, varsayılan boyutlar kullanılıyor: ${url}`);
                resolve({ width: 600, height: 900 }); 
            };
            img.crossOrigin = "Anonymous"; 
            img.src = url;
        });
    }

    // *** YENİ: PhotoSwipe Item Dizisi Hazırlama Fonksiyonu ***
    async function getPhotoSwipeItems(posterList) {
        const dimensionPromises = posterList.map(posterName => {
            const url = `../afisler/${posterName}`;
            return getImageDimensions(url); 
        });

        const dimensions = await Promise.all(dimensionPromises);

        return posterList.map((posterName, index) => {
            return {
                src: `../afisler/${posterName}`,
                width: dimensions[index].width,
                height: dimensions[index].height,
                alt: `Afiş - ${posterName}` 
            };
        });
    }
    
    // *** YENİ: PhotoSwipe Başlatma Fonksiyonu ***
    async function openPhotoSwipe(posterList, startIndex) {
        if (typeof PhotoSwipe === 'undefined') {
             console.error("PhotoSwipe kütüphanesi yüklenmedi. Lütfen HTML'e ekleyin.");
             return;
        }

        const items = await getPhotoSwipeItems(posterList);
        
        if (items.length === 0) return;

        // ÇÖZÜM: HTML'den '.pswp' yapısını arıyoruz.
        const pswpElement = document.querySelector('.pswp'); 
        if (!pswpElement) {
            console.error("PhotoSwipe için gerekli HTML yapısı (örn: .pswp) bulunamadı.");
            return;
        }

        const options = {
            gallery: pswpElement,
            children: 'div', 
            dataSource: items,
            index: startIndex, 
            bgOpacity: 0.9,
            showHideOpacity: true 
        };

        const lightbox = new PhotoSwipe(options); 
        lightbox.init();
    }


    async function fetchPosterData() {
        try {
            const response = await fetch('../afisDates.json');
            const data = await response.json();
            
            posterLookup = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const [day, monthName] = key.split(' ');
                    const monthIndex = monthNames.indexOf(monthName);
                    if (monthIndex !== -1) {
                        const formattedDate = `${String(day).padStart(2, '0')}.${String(monthIndex + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
                        posterLookup[formattedDate] = data[key];
                    }
                }
            }
            initialRender();
        } catch (error) {
            console.error('Afiş tarihleri yüklenirken hata oluştu:', error);
            initialRender();
        }
    }

    function renderCalendar(element, date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay() === 0 ? 7 : new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const daysGrid = element.querySelector('.days-grid');
        daysGrid.innerHTML = '';

        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i > 0; i--) {
            const day = document.createElement('div');
            day.classList.add('day', 'past-month');
            day.textContent = lastDateOfPrevMonth - i + 1;
            daysGrid.appendChild(day);
        }

        for (let i = 1; i <= lastDateOfMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            day.dataset.date = `${String(i).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
            
            if (posterLookup[day.dataset.date]) {
                day.classList.add('has-poster');
            }

            day.addEventListener('click', () => handleDayClick(day));
            daysGrid.appendChild(day);
        }

        const totalDays = daysGrid.children.length;
        const daysInGrid = 7 * 6;
        if (totalDays < daysInGrid) {
            for (let i = 1; i <= daysInGrid - totalDays; i++) {
                const day = document.createElement('div');
                day.classList.add('day', 'next-month');
                day.textContent = i;
                daysGrid.appendChild(day);
            }
        }
    }

    // *** GÜNCELLENDİ: handleDayClick fonksiyonu ***
    function handleDayClick(clickedDay) {
        const currentSelected = document.querySelector('.day.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }

        clickedDay.classList.add('selected');

        let date;
        if (clickedDay.classList.contains('past-month')) {
            const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, clickedDay.textContent);
            date = `${String(prevMonthDate.getDate()).padStart(2, '0')}.${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}.${prevMonthDate.getFullYear()}`;
        } else if (clickedDay.classList.contains('next-month')) {
            const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, clickedDay.textContent);
            date = `${String(nextMonthDate.getDate()).padStart(2, '0')}.${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}.${nextMonthDate.getFullYear()}`;
        } else {
            date = clickedDay.dataset.date;
        }

        const posters = posterLookup[date] || [];

        posterDisplay.innerHTML = '';
        if (posters.length > 0) {
            posterDisplay.classList.add('visible');
            posters.forEach((posterName, index) => {
                const img = document.createElement('img');
                img.src = `../afisler/${posterName}`;
                img.alt = `Afiş - ${date}`;
                
                // PhotoSwipe'ı tıklandığında başlat
                img.addEventListener('click', () => {
                    // Seçili günün tüm afişlerini gönder, tıklananın index'ini başlangıç yap
                    openPhotoSwipe(posters, index);
                });
                
                posterDisplay.appendChild(img);
            });
        } else {
            posterDisplay.classList.remove('visible');
        }
    }

    function updateSliderPosition() {
        calendarSlider.style.transform = `translateX(-${currentMonthIndex * 8.333}%)`;
        const newDate = new Date(currentDate.getFullYear(), currentMonthIndex, 1);
        monthTitle.textContent = newDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' }).toUpperCase();
        
        monthDropdown.value = currentMonthIndex;
    }

    function initialRender() {
        calendarPages.forEach((page, index) => {
            const date = new Date(currentDate.getFullYear(), index, 1);
            renderCalendar(page, date);
        });
        updateSliderPosition();
    }

    function populateMonthDropdown() {
        monthNames.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month.toUpperCase();
            monthDropdown.appendChild(option);
        });
        monthDropdown.value = currentMonthIndex;
    }

    // Olay Dinleyicileri (Ay Navigasyonu ve Dropdown aynı kalır)
    prevMonthButton.addEventListener('click', () => {
        currentMonthIndex = Math.max(currentMonthIndex - 1, 0);
        updateSliderPosition();
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonthIndex = Math.min(currentMonthIndex + 1, 11);
        updateSliderPosition();
    });

    monthTitle.addEventListener('click', () => {
        monthDropdown.style.display = 'block';
        monthDropdown.focus();
    });
    
    monthDropdown.addEventListener('change', (e) => {
        currentMonthIndex = parseInt(e.target.value, 10);
        updateSliderPosition();
        monthTitle.style.display = 'block';
    });
    
    monthDropdown.addEventListener('blur', () => {
        monthDropdown.style.display = 'none';
        monthTitle.style.display = 'block';
    });

    // Takvim Kaydırma (Swipe) işlevi aynı kalır
    calendarSlider.addEventListener('touchstart', (e) => {
        isSwiping = true;
        touchMoved = false;
        touchStartX = e.touches[0].clientX;
        calendarSlider.style.transition = 'none';
    });

    calendarSlider.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        touchCurrentX = e.touches[0].clientX;
        const touchDeltaX = touchCurrentX - touchStartX;
        
        if (Math.abs(touchDeltaX) > 10) {
            touchMoved = true;
        }

        const currentTransform = -currentMonthIndex * 8.333;
        calendarSlider.style.transform = `translateX(calc(${currentTransform}% + ${touchDeltaX}px))`;
    });

    calendarSlider.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const swipeDistance = touchCurrentX - touchStartX;
        const screenWidth = calendarSlider.offsetWidth / 12;
        
        calendarSlider.style.transition = 'transform 0.3s ease-in-out';
        
        if (touchMoved) {
            if (swipeDistance < -screenWidth / 4) {
                currentMonthIndex = Math.min(currentMonthIndex + 1, 11);
            } else if (swipeDistance > screenWidth / 4) {
                currentMonthIndex = Math.max(currentMonthIndex - 1, 0);
            }
        }
        
        updateSliderPosition();
    });

    // Eski tam ekran swipe listener'ları ve global fonksiyonları kaldırıldı.

    // Dropdown'ı başlat
    populateMonthDropdown();
    fetchPosterData();
});