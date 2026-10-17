import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto px-4 py-16">
      <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
        <p class="text-sm text-slate-600 mb-6">Hesabınıza giriş yaparak yazı paylaşmaya başlayın.</p>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              [(ngModel)]="username"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            class="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Giriş Yap
          </button>
        </form>

        <p class="text-sm text-center text-slate-600 mt-6">
          Hesabınız yok mu? <a routerLink="/register" class="text-blue-600 font-medium hover:underline">Kayıt Ol</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = signal<string>('');

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage.set(err.error?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.')
    });
  }
}
