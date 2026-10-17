import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { Category, Post } from '../../core/models/blog.models';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header & Search Filter -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Son Blog Yazıları</h1>
          <p class="text-slate-600 mt-1">Topluluk tarafından paylaşılan güncel içerikleri keşfedin.</p>
        </div>
        <div class="flex gap-2">
          <input
            type="text"
            [(ngModel)]="keyword"
            (keyup.enter)="loadPosts(0)"
            placeholder="Yazılarda ara..."
            class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            (click)="loadPosts(0)"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Ara
          </button>
        </div>
      </div>

      <!-- Categories Filter -->
      @if (categories().length > 0) {
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            (click)="selectCategory(undefined)"
            [class]="selectedCategoryId() === undefined ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition"
          >
            Tümü
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              (click)="selectCategory(cat.id)"
              [class]="selectedCategoryId() === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition"
            >
              {{ cat.name }}
            </button>
          }
        </div>
      }

      <!-- Posts Grid -->
      @if (loading()) {
        <div class="text-center py-12 text-slate-500">Yükleniyor...</div>
      } @else if (posts().length === 0) {
        <div class="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p class="text-slate-600 mb-4">Henüz yayınlanmış bir blog yazısı bulunmuyor.</p>
          <a routerLink="/posts/new" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            İlk Yazıyı Oluştur
          </a>
        </div>
      } @else {
        <div class="grid gap-6 md:grid-cols-2">
          @for (post of posts(); track post.id) {
            <article class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  @if (post.category) {
                    <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {{ post.category.name }}
                    </span>
                  }
                  <span>•</span>
                  <span>{{ post.authorUsername }}</span>
                  <span>•</span>
                  <span>{{ post.createdAt | date:'dd MMM yyyy' }}</span>
                </div>
                <h2 class="text-xl font-semibold text-slate-900 mb-2">
                  <a [routerLink]="['/posts', post.id]" class="hover:text-blue-600 transition">
                    {{ post.title }}
                  </a>
                </h2>
                <p class="text-slate-600 text-sm line-clamp-3 mb-4">
                  {{ post.summary || post.content }}
                </p>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                <div class="flex flex-wrap gap-1">
                  @for (tag of post.tags; track tag) {
                    <span class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{{ tag }}</span>
                  }
                </div>
                <a [routerLink]="['/posts', post.id]" class="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Devamını Oku →
                </a>
              </div>
            </article>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center items-center gap-2 mt-8">
            <button
              (click)="loadPosts(currentPage() - 1)"
              [disabled]="currentPage() === 0"
              class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40"
            >
              Önceki
            </button>
            <span class="text-sm text-slate-600">
              Sayfa {{ currentPage() + 1 }} / {{ totalPages() }}
            </span>
            <button
              (click)="loadPosts(currentPage() + 1)"
              [disabled]="currentPage() + 1 >= totalPages()"
              class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        }
      }
    </div>
  `
})
export class PostListComponent implements OnInit {
  posts = signal<Post[]>([]);
  categories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  selectedCategoryId = signal<number | undefined>(undefined);
  keyword = '';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts(0);
  }

  loadCategories(): void {
    this.postService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  selectCategory(categoryId?: number): void {
    this.selectedCategoryId.set(categoryId);
    this.loadPosts(0);
  }

  loadPosts(page: number): void {
    this.loading.set(true);
    this.postService.getPosts(page, 10, this.selectedCategoryId(), undefined, this.keyword || undefined).subscribe({
      next: (res) => {
        this.posts.set(res.content);
        this.currentPage.set(res.number);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
