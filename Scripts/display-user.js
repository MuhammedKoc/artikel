document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı adını gösterecek element
    const userNameElement = document.getElementById('profile-name');
    
    // localStorage'dan kaydedilen kullanıcı adını al
    const storedFullName = localStorage.getItem('loggedInFullName');

    if (userNameElement && storedFullName) {
        // Eğer element ve isim varsa, içeriğini değiştir
        userNameElement.textContent = storedFullName;
    }
});