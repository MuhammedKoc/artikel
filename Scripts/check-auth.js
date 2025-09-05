// check-auth.js - Güvenli Giriş Kontrolü

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    // localStorage'da kaydedilmiş bir kullanıcı kodu var mı diye kontrol et
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Eğer localStorage'da kullanıcı bilgisi yoksa, giriş sayfasına yönlendir
    if (!loggedInUser) {
        window.location.href = 'Pages/auth.html';
        return; // Fonksiyonu sonlandır
    }

    // Kullanıcı bilgisi varsa, veritabanından doğrula
    try {
        const docRef = doc(db, "users", loggedInUser);
        const docSnap = await getDoc(docRef);

        // Kullanıcı veritabanında yoksa veya verisi eksikse
        if (!docSnap.exists()) {
            // localStorage'daki sahte veya eski bilgiyi temizle
            localStorage.removeItem('loggedInUser');
            // Giriş sayfasına yönlendir
            window.location.href = 'Pages/auth.html';
        }
        // Eğer kullanıcı veritabanında varsa, sayfanın yüklenmesine izin verilir.
        // Bu durumda başka bir şey yapmaya gerek yoktur.

    } catch (error) {
        // Veritabanı bağlantı hatası durumunda da kullanıcıyı dışarı at
        localStorage.removeItem('loggedInUser');
        window.location.href = 'Pages/auth.html';
    }
});