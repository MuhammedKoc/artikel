// auth.js - Final Versiyon (Form Temizleme ve Kontrol Ekleme)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
    // Kendi Firebase projenizin yapılandırma bilgilerini buraya yapıştırın
    apiKey: "AIzaSyAgmHH_8EiC2Gcaot2DtN2LfzwTTADlbGc",
    authDomain: "vizora-1b379.firebaseapp.com",
    projectId: "vizora-1b379",
    storageBucket: "vizora-1b379.firebasestorage.app",
    messagingSenderId: "452110498368",
    appId: "1:452110498368:web:c9c4ecd8271213d78cbda5",
    measurementId: "G-DBCJ5B5RPM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mesaj kutusunu yöneten yardımcı fonksiyon
function displayMessage(message, type, targetElementId) {
    const messageBox = document.getElementById(targetElementId);
    if (!messageBox) {
        return; // Eğer element bulunamazsa fonksiyondan çık
    }
    messageBox.textContent = message;
    messageBox.className = 'message-box ' + type;
    messageBox.style.opacity = '1';
    messageBox.style.visibility = 'visible';

    // Mesajı 5 saniye sonra gizle
    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.style.visibility = 'hidden';
    }, 5000);
}

// Form alanlarını temizleyen yardımcı fonksiyon
function clearFormFields(form) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Eğer linklere tıklanırsa formu değiştir
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            // Yeni form gösterildiğinde mesajı temizle
            const messageBox = document.getElementById('message-box-register');
            if (messageBox) {
                messageBox.style.opacity = '0';
            }
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
            // Yeni form gösterildiğinde mesajı temizle
            const messageBox = document.getElementById('message-box');
            if (messageBox) {
                messageBox.style.opacity = '0';
            }
        });
    }

    // Kayıt olma işlemini yönet
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('#register-username').value;
            const password = registerForm.querySelector('#register-password').value;
            const fullname = registerForm.querySelector('#register-fullname').value;
            const branch = registerForm.querySelector('#register-branch').value;
            const email = registerForm.querySelector('#register-email').value;

            if (isNaN(username)) {
                displayMessage("Kullanıcı kodunuz sadece sayılardan oluşmalıdır.", "error", "message-box-register");
                return;
            }

            // Önce kullanıcı adının veritabanında olup olmadığını kontrol et
            getDoc(doc(db, "users", username)).then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    // Kullanıcı kodu zaten mevcutsa hata göster
                    displayMessage("Bu kullanıcı kodu zaten mevcut.", "error", "message-box-register");
                } else {
                    // Kullanıcı kodu mevcut değilse kayıt işlemini yap
                    setDoc(doc(db, "users", username), {
                        fullname: fullname,
                        branch: branch,
                        password: password,
                        email: email
                    })
                    .then(() => {
                        displayMessage("Kayıt işlemi başarılı! Hoş geldiniz.", "success", "message-box-register");
                        
                        // Kayıt başarılı olduktan sonra formu temizle
                        clearFormFields(registerForm);

                        // 2 saniye sonra giriş formuna geçiş yap
                        setTimeout(() => {
                            loginForm.classList.add('active');
                            registerForm.classList.remove('active');
                        }, 2000); 
                    })
                    .catch((error) => {
                        displayMessage("Kayıt olurken bir hata oluştu.", "error", "message-box-register");
                    });
                }
            }).catch((error) => {
                displayMessage("Kullanıcı kontrolü sırasında bir hata oluştu.", "error", "message-box-register");
            });
        });
    }

    // Giriş yapma işlemini yönet
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('#login-username').value;
            const password = loginForm.querySelector('#login-password').value;

            getDoc(doc(db, "users", username)).then((doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    if (userData.password === password) {
                        displayMessage("Giriş başarılı! Hoş geldiniz.", "success", "message-box");

                        localStorage.setItem('loggedInUser', username);
                        localStorage.setItem('loggedInFullName', userData.fullname);
                        localStorage.setItem('loggedInPassword', userData.password);


                        setTimeout(() => {
                            window.location.href = "../index.html";
                        }, 1000);
                    } else {
                        displayMessage("Şifreniz yanlış.", "error", "message-box");
                    }
                } else {
                    displayMessage("Kullanıcı kodu bulunamadı.", "error", "message-box");
                }
            }).catch((error) => {
                displayMessage("Giriş yaparken bir hata oluştu.", "error", "message-box");
            });
        });
    }
});