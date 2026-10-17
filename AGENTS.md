# Blog Platformu — Proje Hafızası ve Mimari Kurallar

Bu dosya (`AGENTS.md`), projenin teknoloji yığınını, mimari yapısını, veritabanı yapılandırmasını ve geliştirme kurallarını kalıcı olarak tanımlar.

## 1. Teknoloji Yığını (Tech Stack)
- **Backend:** Java 17+ (Yerel ortam: Java 20), Spring Boot 3.3.4, Spring Security (Stateless JWT), Spring Data JPA, Jakarta Validation, Lombok, Maven Wrapper (`mvnw.cmd`)
- **Veritabanı:** PostgreSQL (`jdbc:postgresql://localhost:5432/blog-web-site`)
  - **Kullanıcı Adı / Şifre / JWT Secret:** Gitignore'lı `application-local.yml` (profil: `local`) veya ortam değişkenleri (`DB_USER`, `DB_PASSWORD`, `JWT_SECRET`) ile verilir. **Sırlar bu dosyaya, `application.yml`'e veya koda asla yazılmaz.**
- **Frontend:** Angular 18 (Standalone Components, Signals), Tailwind CSS, PrimeNG / PrimeIcons
- **İletişim:** RESTful JSON API (`http://localhost:8080/api/...` <-> `http://localhost:4200`)

## 2. Dizin ve Paket Yapısı

### Backend (`backend/`)
Ana paket: `com.blog.backend`
- `entity/`:
  - `User` (`UserDetails` implementasyonu, `users` tablosu)
  - `Role` (`ROLE_USER`, `ROLE_ADMIN`)
  - `Post` (`posts` ve `post_tags` tabloları)
  - `Category` (`categories` tablosu)
- `repository/`: `UserRepository`, `PostRepository` (sayfalama, kategori, etiket ve anahtar kelime arama destekli), `CategoryRepository`
- `security/`: `JwtService`, `JwtAuthenticationFilter`
- `config/`:
  - `SecurityConfig` (CORS `http://localhost:4200` + Stateless JWT)
  - `ApplicationConfig` (`BCryptPasswordEncoder`, `AuthenticationProvider`, `UserDetailsService`)
  - `DataInitializer` (Uygulama başlangıcında örnek kategorileri, varsayılan `admin` hesabını ve hoş geldiniz yazısını oluşturur — **yalnızca geliştirme seed'i**, üretime taşınmamalı)
- `dto/`: `AuthDtos` (`RegisterRequest`, `LoginRequest`, `AuthResponse`), `BlogDtos` (`PostRequest`, `PostResponse`, `CategoryDto`)
- `service/`: `AuthService`, `PostService`
- `controller/`: `AuthController` (`/api/auth/**`), `PostController` (`/api/posts/**`), `CategoryController` (`/api/categories/**`)
- `exception/`: `GlobalExceptionHandler`
- `src/main/resources/`:
  - `application.yml`: Paylaşılan ayarlar — DB URL, Hibernate (`ddl-auto: update`), `spring.sql.init.mode: always`, JWT süreleri. Sırlar burada `${DB_PASSWORD}` / `${JWT_SECRET}` tutamaçlarıdır; değerleri gitignore'lı `application-local.yml` (profil: `local`) veya ortam değişkenleri sağlar.
  - `application-local.yml`: **Gitignore'lı — commit edilmez.** Gerçek DB şifresi ve JWT secret'inin yaşadığı dosya; klonlayan herkes kendi kopyasını oluşturur (bkz. aşağıdaki "Güvenli Yapılandırma").
  - `schema.sql`: `users`, `categories`, `posts`, `post_tags` tablolarının DDL şeması ve başlangıç kategorileri.
- **Önemli Derleme/Çalıştırma Notu:** Windows'ta Türkçe karakterli dizin (`Masaüstü`) altında `ClassNotFoundException` yaşanmaması için `pom.xml` içindeki `spring-boot-maven-plugin` yapılandırmasında `<fork>false</fork>` tanımlıdır.

### Frontend (`frontend/`)
Ana kaynak dizini: `src/app`
- `core/models/blog.models.ts`: `AuthResponse`, `Category`, `Post`, `PostRequest`, `PageResponse<T>`
- `core/services/`:
  - `auth.service.ts`: Signal tabanlı kullanıcı oturum durumu (`currentUser`, `isLoggedIn`, `isAdmin`) ve `localStorage` yönetimi (`blog_auth_user`).
  - `post.service.ts`: Yazı listeleme (sayfalama/filtreleme), detay, CRUD ve kategori istekleri.
- `core/interceptors/jwt.interceptor.ts`: İsteklere otomatik `Authorization: Bearer <token>` ekleyen fonksiyonel interceptor.
- `core/guards/auth.guard.ts`: Giriş yapmamış kullanıcıları `/login` sayfasına yönlendiren route guard.
- `pages/`:
  - `post-list`: Sayfalamalı blog listesi, kategori ve anahtar kelime arama filtreleri.
  - `post-detail`: Blog detayı, sadece yazı sahibi (`authorId === user.id`) veya `ROLE_ADMIN` için düzenleme/silme kontrolleri.
  - `post-form`: Yeni yazı oluşturma ve mevcut yazıyı düzenleme formu.
  - `login` & `register`: Kimlik doğrulama sayfaları.

## 3. Temel İş Kuralları
1. **Kimlik Doğrulama:** Tüm oturumlar JWT ile stateless olarak yönetilir.
2. **Yetkilendirme:**
   - `GET /api/posts/**` ve `GET /api/categories/**` herkese açıktır.
   - Yazı oluşturma (`POST /api/posts`) giriş yapmış kullanıcı gerektirir.
   - Yazı düzenleme (`PUT /api/posts/{id}`) ve silme (`DELETE /api/posts/{id}`) işlemleri **yalnızca yazının yazarı veya `ROLE_ADMIN`** rolüne sahip kullanıcılar tarafından yapılabilir.
   - Kategori oluşturma (`POST /api/categories`) `ROLE_ADMIN` yetkisi gerektirir.
3. **Çalıştırma Komutları:**
   - **Backend:** `cd backend && .\mvnw.cmd spring-boot:run`
   - **Frontend:** `cd frontend && npm start`

## 4. Güvenli Yapılandırma (Sırlar)
- Sırlar (`DB_PASSWORD`, `JWT_SECRET`) **yalnızca** `backend/src/main/resources/application-local.yml` (gitignore'lı) veya ortam değişkenleri içinde yaşar.
- Yeni klonlamada `application-local.yml` oluşturulur: DB şifren ve 256-bit rastgele bir JWT secret'i (ör. `[Convert]::ToHexString` ile üretilen 64 hex karakter) yazılır. Dosya yoksa uygulama bilinçli olarak **başlamaz** (fail-fast).
- Sırlar koda, `application.yml`'e, bu dosyaya veya commit geçmişine **asla** girmez.
- İlk commit'ten önce `.gitignore` dosyaları korunur; `target/`, `node_modules/`, `dist/`, `.env*` ve `application-local.yml` asla eklenmez.
