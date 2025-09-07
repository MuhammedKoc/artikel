document.addEventListener('DOMContentLoaded', () => {
    const monthTitle = document.querySelector('.month-title');
    const calendarSlider = document.querySelector('.calendar-slider');
    const calendarPages = document.querySelectorAll('.calendar-page');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    const posterDisplay = document.querySelector('.poster-display');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    // Yeni eklenen elemanları seç
    const monthSelector = document.querySelector('.month-selector');
    const monthDropdown = document.getElementById('month-dropdown');

    let posterLookup = {};
    let currentDate = new Date();
    let currentMonthIndex = currentDate.getMonth();
    let isSwiping = false;
    let touchStartX = 0;
    let touchCurrentX = 0;
    let touchMoved = false;

    let currentPosters = [];
    let currentPosterIndex = 0;
    let isSwipingFullscreen = false;
    let touchStartXFullscreen = 0;
    let touchCurrentXFullscreen = 0;

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

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

        currentPosters = posterLookup[date] || [];

        posterDisplay.innerHTML = '';
        if (currentPosters.length > 0) {
            posterDisplay.classList.add('visible');
            currentPosters.forEach((posterName, index) => {
                const img = document.createElement('img');
                img.src = `../afisler/${posterName}`;
                img.alt = `Afiş - ${date}`;
                img.addEventListener('click', () => openFullscreen(index));
                posterDisplay.appendChild(img);
            });
        } else {
            posterDisplay.classList.remove('visible');
        }
    }

    function openFullscreen(index) {
        currentPosterIndex = index;
        updateFullscreenImage();
        fullscreenOverlay.style.display = 'flex';
    }

    function closeFullscreen() {
        fullscreenOverlay.style.display = 'none';
    }

    function updateFullscreenImage() {
        if (currentPosters.length > 0) {
            const posterName = currentPosters[currentPosterIndex];
            fullscreenImage.src = `../afisler/${posterName}`;
        }
    }

    function prevImage() {
        currentPosterIndex = (currentPosterIndex - 1 + currentPosters.length) % currentPosters.length;
        updateFullscreenImage();
    }

    function nextImage() {
        currentPosterIndex = (currentPosterIndex + 1) % currentPosters.length;
        updateFullscreenImage();
    }

    function updateSliderPosition() {
        calendarSlider.style.transform = `translateX(-${currentMonthIndex * 8.333}%)`;
        const newDate = new Date(currentDate.getFullYear(), currentMonthIndex, 1);
        monthTitle.textContent = newDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' }).toUpperCase();
        
        // Dropdown'ın seçili ayını güncelle
        monthDropdown.value = currentMonthIndex;
    }

    function initialRender() {
        calendarPages.forEach((page, index) => {
            const date = new Date(currentDate.getFullYear(), index, 1);
            renderCalendar(page, date);
        });
        updateSliderPosition();
    }

    // Dropdown'ı doldurma fonksiyonu
    function populateMonthDropdown() {
        monthNames.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month.toUpperCase();
            monthDropdown.appendChild(option);
        });
        monthDropdown.value = currentMonthIndex;
    }

    // Olay Dinleyicileri
    prevMonthButton.addEventListener('click', () => {
        currentMonthIndex = Math.max(currentMonthIndex - 1, 0);
        updateSliderPosition();
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonthIndex = Math.min(currentMonthIndex + 1, 11);
        updateSliderPosition();
    });

    // Ay başlığını tıklanabilir yap
    monthTitle.addEventListener('click', () => {
        monthDropdown.style.display = 'block';
        monthDropdown.focus();
    });
    
    // Dropdown'dan bir ay seçilince
    monthDropdown.addEventListener('change', (e) => {
        currentMonthIndex = parseInt(e.target.value, 10);
        updateSliderPosition();
        monthTitle.style.display = 'block';
    });
    
    // Dropdown'dan odağı kaybedince eski haline dön
    monthDropdown.addEventListener('blur', () => {
        monthDropdown.style.display = 'none';
        monthTitle.style.display = 'block';
    });

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

    // Tam ekran için kaydırma işlevselliği
    fullscreenOverlay.addEventListener('touchstart', (e) => {
        isSwipingFullscreen = true;
        touchStartXFullscreen = e.touches[0].clientX;
    });

    fullscreenOverlay.addEventListener('touchend', (e) => {
        if (!isSwipingFullscreen) return;
        isSwipingFullscreen = false;
        touchCurrentXFullscreen = e.changedTouches[0].clientX;
        const swipeDistance = touchCurrentXFullscreen - touchStartXFullscreen;

        if (swipeDistance < -50) {
            nextImage();
        } else if (swipeDistance > 50) {
            prevImage();
        }
    });

    // Fonksiyonları global scope'a taşıma
    window.closeFullscreen = closeFullscreen;
    window.prevImage = prevImage;
    window.nextImage = nextImage;

    // Dropdown'ı başlat
    populateMonthDropdown();
    fetchPosterData();
});