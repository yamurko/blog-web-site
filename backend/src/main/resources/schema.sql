-- Blog Platformu PostgreSQL Tablo Şeması (blog-web-site)

-- 1. Kullanıcılar Tablosu (users)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kategoriler Tablosu (categories)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500)
);

-- 3. Blog Yazıları Tablosu (posts)
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 4. Yazı Etiketleri Tablosu (post_tags)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag VARCHAR(255)
);

-- Başlangıç Kategorileri
INSERT INTO categories (name, slug, description) VALUES
    ('Yazılım Geliştirme', 'yazilim-gelistirme', 'Java, Spring Boot, Angular ve modern yazılım mimarileri üzerine yazılar.'),
    ('Teknoloji & Gündem', 'teknoloji-gundem', 'Teknoloji dünyasındaki son gelişmeler ve incelemeler.'),
    ('Tasarım & UI/UX', 'tasarim-ui-ux', 'Web arayüz tasarımı, Tailwind CSS ve kullanıcı deneyimi ipuçları.')
ON CONFLICT (slug) DO NOTHING;
