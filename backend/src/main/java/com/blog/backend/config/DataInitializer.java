package com.blog.backend.config;

import com.blog.backend.entity.Category;
import com.blog.backend.entity.Post;
import com.blog.backend.entity.Role;
import com.blog.backend.entity.User;
import com.blog.backend.repository.CategoryRepository;
import com.blog.backend.repository.PostRepository;
import com.blog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Category dev;
        if (categoryRepository.count() == 0) {
            dev = categoryRepository.save(Category.builder()
                    .name("Yazılım Geliştirme")
                    .slug("yazilim-gelistirme")
                    .description("Java, Spring Boot, Angular ve modern yazılım mimarileri üzerine yazılar.")
                    .build());

            categoryRepository.save(Category.builder()
                    .name("Teknoloji & Gündem")
                    .slug("teknoloji-gundem")
                    .description("Teknoloji dünyasındaki son gelişmeler ve incelemeler.")
                    .build());

            categoryRepository.save(Category.builder()
                    .name("Tasarım & UI/UX")
                    .slug("tasarim-ui-ux")
                    .description("Web arayüz tasarımı, Tailwind CSS ve kullanıcı deneyimi ipuçları.")
                    .build());
        } else {
            dev = categoryRepository.findBySlug("yazilim-gelistirme").orElse(null);
        }

        if (userRepository.count() == 0) {
            User admin = userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@blog.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            postRepository.save(Post.builder()
                    .title("Blog Platformuna Hoş Geldiniz!")
                    .summary("Spring Boot 3, PostgreSQL ve Angular 18 ile geliştirilen yeni blog platformumuz yayında.")
                    .content("Bu platform üzerinden kendi blog yazılarınızı oluşturabilir, kategorilere ayırabilir ve etiketleyebilirsiniz.\n\nTeknik Yığın:\n- Backend: Spring Boot 3.3.4, Spring Security (JWT), Spring Data JPA\n- Veritabanı: PostgreSQL (blog-web-site)\n- Frontend: Angular 18, Tailwind CSS, PrimeNG")
                    .author(admin)
                    .category(dev)
                    .tags(Set.of("springboot", "angular", "postgresql"))
                    .published(true)
                    .build());

            log.info("Başlangıç admin kullanıcısı (admin / admin123) ve örnek yazı oluşturuldu.");
        }
    }
}
