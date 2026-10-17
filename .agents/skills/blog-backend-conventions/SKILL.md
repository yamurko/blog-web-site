---
name: blog-backend-conventions
description: Blog platformunun Spring Boot backend'inde (backend/ dizini) Java kodu yazarken veya düzenlerken kullan. Controller, service, repository, DTO ve entity katmanları arasi akis; JWT ile yetkilendirme ve sahip kontrolü (ownership); hata yonetimi; dogrulama (Jakarta Validation) ve veritabanı erisim kurallarini kapsar. Use when creating, modifying or reviewing backend Java code — controllers, services, repositories, DTOs, entities, security or exception handling.
---

# Blog Backend Konvansiyonları

Bu kurallar `backend/` altında (paket: `com.blog.backend`) kod yazarken geçerlidir.
Mimari detaylar için `AGENTS.md`'ye bak; bu dosya sadece **karar anındaki ince kuralları** tanımlar.

## 1. Katman Akışı (katı)

```
controller → service → repository
```

- Controller **asla** repository'e doğrudan erişmez; tüm iş mantığı service'tedir.
- Controller sadece: isteği alır, `@Valid` ile doğrular, service'i çağırır, DTO döner.
- Service **asla** HTTP nesnesi (HttpServletRequest, ResponseEntity içinde durum kararı vb.) tutmaz.
- Service herkese açılmayan bir endpoint'in **yetkilendirme kararını da içermelidir** (bkz. §3).

## 2. Entity ↔ DTO Kuralları

- Entity (`Post`, `User`, `Category`) **asla** controller'dan dışarı çıkmaz, API yanıtına girmez.
  Nedenleri: JPA lazy-loading döngüleri, `passwordHash` sızıntısı, alan adı değişikliği API'yi kırar.
- Controller'ın imzası her zaman DTO tipleridir: `PostRequest` girer, `PostResponse` çıkar.
- Entity→DTO dönüşümü controller'da `new` ile değil, **service katmanında** yapılır.
- `PostResponse` içinde `author` alanı olarak yalnızca `(id, username)` gibi güvenli özet taşınır.

## 3. Yetkilendirme: Sahiplik (ownership) kontrolü

Yazı düzenle/sil sadece yazar veya ROLE_ADMIN içindir. Bu kontrol **service içindedir**:

```java
// DOĞRU: service içinde, veritabanından gerekçeyle
Post post = postRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Post", id));
boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
if (!isOwner && !isAdmin(currentUser)) {
    throw new AccessDeniedException("Yalnızca yazar veya admin silebilir");
}
```

- Kontrol **asla** istemciden gelen `authorId` alanına güvenilerek yapılmaz; yazının gerçek
  sahibi veritabanından okunur.
- `currentUser`, controller'a `@AuthenticationPrincipal User user` ile gelir; elle parse edilmez.

## 4. Doğrulama (Validation)

- Tüm request DTO alanlarına Jakarta Validation annotation'ları eklenir:
  `@NotBlank`, `@Size(min=..., max=...)`, `@Email`.
- Controller metod parametresinde `@Valid @RequestBody ...` birlikte kullanılır.
- Kural ihlali `MethodArgumentNotValidException` olarak fırlatılır;
  `GlobalExceptionHandler` bunu 400 + alan hataları listesi olarak yanıtlar.

## 5. Hata Yönetimi

- Domain'e özgü istisna durumlar için exception paketinde anlamlı isimlerle sınıf açılır
  (ör. `ResourceNotFoundException`, `OwnershipViolationException`) ve hepsi
  `GlobalExceptionHandler`'da tek yerden map'lenir.
- Controller'da `try/catch` ile hata **gizlenmez**; service fırlatır, handler yakalar.
- API'ye asla ham exception mesajı (`ex.getMessage()`, stacktrace) dönmez — her zaman
  tutarlı bir hata gövdesi: `{ "timestamp", "status", "error", "message" }`.

## 6. Repository Kuralları

- Derived query kullan: `findByAuthorId(Long id)`, `findByCategoryId(...)`.
- Karmaşık sorgular `@Query` ile JPQL; native query **son çare**.
- Listeleme her zaman `Pageable` alır ve `Page<T>` döner (sayfalama zorunlu).
- Repository'de iş mantığı, default metod içinde hesaplama **yok** — o service'in işi.

## 7. Yasaklar (Negative Constraints)

- DO NOT: controller'dan repository çağırmak.
- DO NOT: entity'yi JSON'a serileştirmek için `@JsonIgnore` yaması yapmak — DTO'ya geç.
- DO NOT: `printStackTrace()`, `System.out.println()` veya boş `catch (Exception e) {}` blokları.
- DO NOT: JWT secret'ini, DB şifresini veya herhangi bir sırrı Java koduna gömmek.
  Sırlar `application.yml` + ortam değişkeni (`${DB_PASSWORD}`) ile gelir.
- DO NOT: `ddl-auto: update` yerine üretim için bu ayarı değiştirmeden deploy düşünmek;
  şema değişiklikleri `schema.sql` üzerinden versionlanır.
- DO NOT: mevcut controller'ların yol isimlerini (`/api/posts/**`) veya DTO alan adlarını
  sessizce değiştirmek — frontend buna bağlıdır; değiştireceksen AGENTS.md'yi de güncelle.

## 8. Değişiklik Sonrası Kontrol

Backend kodu değiştirildikten sonra derleme kontrolü çalıştırılır:

```powershell
cd backend && .\mvnw.cmd compile -q
```

Derleme hatası varsa iş bitmiş sayılmaz.
