import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth/';
  private authStatus = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  authStatus$ = this.authStatus.asObservable();
  currentUser$ = this.currentUser.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    this.authStatus.next(isLoggedIn);
    this.currentUser.next(isLoggedIn ? this.getUserData() : null);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, userData, this.httpOptions).pipe(
      catchError(error => {
        console.error('Erreur d\'inscription:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, { email, password }).pipe(
        tap((response: any) => {
            if (!response.data?.access || !response.data?.refresh) {
                throw new Error('Invalid login response');
            }
            
            const authData = {
                access_token: response.data.access,
                refresh_token: response.data.refresh,
                user_type: response.data.user_type,
                email: response.data.email,
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                user_id: response.data.user_id
            };
            
            this.storeAuthData(authData);
            this.authStatus.next(true);
            this.currentUser.next(this.getUserData());
        }),
        catchError(error => {
            console.error('Erreur de connexion:', error);
            this.logout();
            return throwError(() => error);
        })
    );
}

logout(): void {
  localStorage.clear();
  this.authStatus.next(false);
  this.currentUser.next(null);
  // Redirection vers la page d'accueil après déconnexion
  this.router.navigate(['/']);
}

  

storeAuthData(response: any): void {
  localStorage.setItem('token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
  localStorage.setItem('user_type', response.user_type);
  localStorage.setItem('email', response.email);
  localStorage.setItem('first_name', response.first_name);
  localStorage.setItem('last_name', response.last_name);
  localStorage.setItem('user_id', response.user_id);
  if (response.agency_name) {
      localStorage.setItem('agency_name', response.agency_name);
  }
  if (response.agency_address) {
      localStorage.setItem('agency_address', response.agency_address);
  }
}

private getUserData(): any {
  return {
      email: localStorage.getItem('email'),
      first_name: localStorage.getItem('first_name') || '',
      last_name: localStorage.getItem('last_name') || '',
      user_type: localStorage.getItem('user_type'),
      agency_name: localStorage.getItem('agency_name'),
      agency_address: localStorage.getItem('agency_address')
  };
}


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserType(): string | null {
    const user = this.currentUser.value;
    return user ? user.user_type : null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        this.logout();
        return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}token/refresh/`, { refresh: refreshToken }).pipe(
        tap((response: any) => {
            localStorage.setItem('token', response.access);
            // Stocker le nouveau refresh token si renvoyé (optionnel)
            if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
            }
            this.authStatus.next(true);
        }),
        catchError(error => {
            this.logout();
            return throwError(() => error);
        })
    );
}
}