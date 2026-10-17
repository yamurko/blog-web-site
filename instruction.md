\# Proje: Blog Platformu



\## 1. Genel Amaç

Kullanıcıların kayıt olup giriş yapabildiği, blog yazıları oluşturup yayınlayabildiği tam kapsamlı bir web uygulaması.



\## 2. Teknoloji Yığını (Tech Stack)

\- \*\*Backend:\*\* Java 17/21, Spring Boot 3.x, Spring Security (JWT tabanlı kimlik doğrulama), Spring Data JPA

\- \*\*Veritabanı:\*\* PostgreSQL

\- \*\*Frontend:\*\* Angular, PrimeNG / Tailwind CSS

\- \*\*API Mimarisi:\*\* RESTful JSON API



\## 3. Temel Özellikler

\### Kimlik Doğrulama \& Yetkilendirme

\- Kullanıcı kaydı (register) ve girişi (login).

\- Stateless JWT ile oturum yönetimi.

\- Rol yapısı (örn. `ROLE\_USER`, `ROLE\_ADMIN`).



\### Blog Modülü

\- Blog yazılarını listeleme (sayfalama - pagination ile).

\- Blog detayı görüntüleme.

\- Yazı oluşturma, düzenleme ve silme (CRUD) — sadece yazar veya admin düzenleyebilir.

\- Kategori veya etiket desteği.



\## 4. Proje Yapısı Tercihi

\- `backend/` (Spring Boot projesi)

\- `frontend/` (Angular projesi)

