import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Category, PostRequest } from '../../core/models/blog.models';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900 mb-6">
          {{ isEditMode() ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Oluştur' }}
        </h1>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
            <input
              type="text"
              name="title"
              [(ngModel)]="title"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yazı başlığı..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Kısa Özet (Opsiyonel)</label>
            <input
              type="text"
              name="summary"
              [(ngModel)]="summary"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Liste görünümünde gösterilecek kısa açıklama..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                name="categoryId"
                [(ngModel)]="categoryId"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option [ngValue]="undefined">Kategori Seçin</option>
                @for (cat of categories(); track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Etiketler (Virgülle ayırın)</label>
              <input
                type="text"
                name="tagsInput"
                [(ngModel)]="tagsInput"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="spring, angular, java"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">İçerik</label>
            <textarea
              name="content"
              [(ngModel)]="content"
              rows="10"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yazı içeriğini buraya girin..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4">
            <a routerLink="/" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              İptal
            </a>
            <button
              type="submit"
              class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              {{ isEditMode() ? 'Güncelle' : 'Yayınla' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PostFormComponent implements OnInit {
  isEditMode = signal<boolean>(false);
  postId?: number;
  categories = signal<Category[]>([]);
  errorMessage = signal<string>('');

  title = '';
  summary = '';
  content = '';
  categoryId?: number;
  tagsInput = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.postService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.postId = Number(idParam);
      this.postService.getPostById(this.postId).subscribe({
        next: (post) => {
          this.title = post.title;
          this.summary = post.summary || '';
          this.content = post.content;
          this.categoryId = post.category?.id;
          this.tagsInput = post.tags ? post.tags.join(', ') : '';
        }
      });
    }
  }

  onSubmit(): void {
    const tags = this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload: PostRequest = {
      title: this.title,
      summary: this.summary,
      content: this.content,
      categoryId: this.categoryId,
      tags,
      published: true
    };

    const request$ = this.isEditMode() && this.postId
      ? this.postService.updatePost(this.postId, payload)
      : this.postService.createPost(payload);

    request$.subscribe({
      next: (saved) => this.router.navigate(['/posts', saved.id]),
      error: (err) => this.errorMessage.set(err.error?.message || 'İşlem sırasında bir hata oluştu.')
    });
  }
}
