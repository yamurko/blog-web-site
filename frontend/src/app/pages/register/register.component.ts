import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto px-4 py-16">
      <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Kayıt Ol</h1>
        <p class="text-sm text-slate-600 mb-6">Yeni bir hesap oluşturun ve topluluğa katılın.</p>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onRegister()" class="space-y-4">
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
            <label class="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
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
            Kayıt Ol
          </button>
        </form>

        <p class="text-sm text-center text-slate-600 mt-6">
          Zaten hesabınız var mı? <a routerLink="/login" class="text-blue-600 font-medium hover:underline">Giriş Yap</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = signal<string>('');

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => this.errorMessage.set(err.error?.message || 'Kayıt sırasında bir hata oluştu.')
    });
  }
}
