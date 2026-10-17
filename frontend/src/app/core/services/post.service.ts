import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, PageResponse, Post, PostRequest } from '../models/blog.models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly postsUrl = 'http://localhost:8080/api/posts';
  private readonly categoriesUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  getPosts(page = 0, size = 10, categoryId?: number, tag?: string, keyword?: string): Observable<PageResponse<Post>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (categoryId) params = params.set('categoryId', categoryId);
    if (tag) params = params.set('tag', tag);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get<PageResponse<Post>>(this.postsUrl, { params });
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}/${id}`);
  }

  createPost(payload: PostRequest): Observable<Post> {
    return this.http.post<Post>(this.postsUrl, payload);
  }

  updatePost(id: number, payload: PostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.postsUrl}/${id}`, payload);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.postsUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }
}
