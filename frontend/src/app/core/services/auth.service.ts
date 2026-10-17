import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/blog.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly storageKey = 'blog_auth_user';

  private currentUserSignal = signal<AuthResponse | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ROLE_ADMIN');

  constructor(private http: HttpClient) {}

  register(payload: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => this.saveUserToStorage(res))
    );
  }

  login(payload: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.saveUserToStorage(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token ?? null;
  }

  private saveUserToStorage(user: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): AuthResponse | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
