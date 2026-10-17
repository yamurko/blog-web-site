import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/blog.models';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <a routerLink="/" class="text-sm text-blue-600 hover:underline inline-block mb-6">← Tüm Yazılara Dön</a>

      @if (loading()) {
        <div class="text-center py-12 text-slate-500">Yükleniyor...</div>
      } @else {
        @if (post(); as p) {
          <article class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2 text-xs text-slate-500">
                @if (p.category) {
                  <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {{ p.category.name }}
                  </span>
                }
                <span>Yazar: <strong class="text-slate-700">{{ p.authorUsername }}</strong></span>
                <span>•</span>
                <span>{{ p.createdAt | date:'dd MMMM yyyy HH:mm' }}</span>
              </div>

              @if (canModify()) {
                <div class="flex items-center gap-2">
                  <a
                    [routerLink]="['/posts', p.id, 'edit']"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                  >
                    Düzenle
                  </a>
                  <button
                    (click)="deletePost(p.id)"
                    class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Sil
                  </button>
                </div>
              }
            </div>

            <h1 class="text-3xl font-bold text-slate-900 mb-6">{{ p.title }}</h1>

            <div class="prose max-w-none text-slate-700 whitespace-pre-line leading-relaxed mb-8">
              {{ p.content }}
            </div>

            @if (p.tags && p.tags.length > 0) {
              <div class="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
                @for (tag of p.tags; track tag) {
                  <span class="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">#{{ tag }}</span>
                }
              </div>
            }
          </article>
        } @else {
          <div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
            Blog yazısı bulunamadı.
          </div>
        }
      }
    </div>
  `
})
export class PostDetailComponent implements OnInit {
  post = signal<Post | null>(null);
  loading = signal<boolean>(true);

  canModify = computed(() => {
    const currentPost = this.post();
    const user = this.authService.currentUser();
    if (!currentPost || !user) return false;
    return currentPost.authorId === user.id || user.role === 'ROLE_ADMIN';
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.postService.getPostById(id).subscribe({
        next: (res) => {
          this.post.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  deletePost(id: number): void {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    this.postService.deletePost(id).subscribe({
      next: () => this.router.navigate(['/'])
    });
  }
}