import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8000/api/admin/';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPendingAnnonces(): Observable<any> {
    return this.http.get(`${this.apiUrl}annonces/`, { headers: this.getHeaders() });
  }

  approveAnnonce(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}annonces/${id}/approve/`, {}, { headers: this.getHeaders() });
  }

  rejectAnnonce(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}annonces/${id}/reject/`, {}, { headers: this.getHeaders() });
  }
  
}
