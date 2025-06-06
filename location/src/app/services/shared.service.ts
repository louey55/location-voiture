import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private readonly APIUrl = "http://localhost:8000";
  private cartCount = new BehaviorSubject<number>(0);

  constructor(
    public http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  getApiUrl(): string {
    return this.APIUrl;
  }

  public getJsonAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getFormDataAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAnnonces(): Observable<any> {
    return this.http.get(`${this.APIUrl}/api/annonces/public/`).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => new Error(
          error.status === 500 
            ? 'Erreur serveur. Contactez l\'administrateur.'
            : 'Impossible de charger les données. Veuillez réessayer.'
        ));
      })
    );
  }

  addAnnonce(formData: FormData): Observable<any> {
    const headers = this.getFormDataAuthHeaders();
    
    return this.http.post(`${this.APIUrl}/api/annonces/`, formData, { 
      headers: headers
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(() => this.addAnnonce(formData));
        }
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handle401Error(retryFn: () => Observable<any>): Observable<any> {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const headers = this.getFormDataAuthHeaders();
        return retryFn();
      }),
      catchError(refreshError => {
        this.authService.logout();
        this.router.navigate(['/se-connecter']);
        return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
      })
    );
  }

  private handleError(error: HttpErrorResponse): Error {
    console.error('Erreur API:', error);
    
    if (error.status === 0) {
      return new Error('Erreur de connexion au serveur');
    } else if (error.status === 404) {
      return new Error('Ressource introuvable');
    } else if (error.status >= 500) {
      return new Error('Erreur serveur. Veuillez réessayer plus tard.');
    }
    
    return new Error(error.error?.message || 'Une erreur est survenue');
  }

  createReservation(reservationData: any): Observable<any> {
    const headers = this.getJsonAuthHeaders();
    return this.http.post(`${this.APIUrl}/api/reservations/`, reservationData, { headers });
  }

  getReservations(): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    const headers = this.getJsonAuthHeaders();
    return this.http.get(`${this.APIUrl}/api/reservations/`, { headers }).pipe(
      switchMap((reservations: any) => {
        if (!reservations || reservations.length === 0) {
          return of([]);
        }
        const detailedReservations = reservations.map((reservation: any) => {
          return this.http.get(`${this.APIUrl}/api/annonces/${reservation.vehicle}/`, { headers }).pipe(
            map((vehicleDetails: any) => ({
              ...reservation,
              vehicle: vehicleDetails
            }))
          );
        });
        return forkJoin(detailedReservations);
      }),
      catchError(error => {
        console.error('Error loading reservations:', error);
        return of([]);
      })
    );
  }

  deleteReservation(id: number): Observable<any> {
    const headers = this.getJsonAuthHeaders();
    return this.http.delete(`${this.APIUrl}/api/reservations/${id}/`, { headers });
  }

  getCartCount(): Observable<number> {
    this.updateCartCount();
    return this.cartCount.asObservable();
  }

  updateCartCount(): void {
    this.getReservations().subscribe({
      next: (reservations) => {
        this.cartCount.next(reservations?.length || 0);
      },
      error: () => {
        this.cartCount.next(0);
      }
    });
  }

  getAgencyReservations(): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }
  
    const headers = this.getJsonAuthHeaders();
    return this.http.get(`${this.APIUrl}/api/agency/reservations/`, { headers }).pipe(
      switchMap((reservations: any) => {
        if (!reservations || reservations.length === 0) {
          return of([]);
        }
        
        // Supprimez la partie qui cherche les détails du client via /api/users/
        // Utilisez directement les données retournées par l'API
        const detailedReservations = reservations.map((reservation: any) => ({
          ...reservation,
          client: {
            first_name: reservation.client_first_name,
            last_name: reservation.client_last_name,
            email: reservation.client_email
          }
        }));
        
        return of(detailedReservations);
      }),
      catchError(error => {
        console.error('Error loading agency reservations:', error);
        return of([]);
      })
    );
  }

  confirmAgencyReservation(reservationId: number): Observable<any> {
    const headers = this.getJsonAuthHeaders();
    return this.http.patch(
      `${this.APIUrl}/api/reservations/${reservationId}/confirm/`,
      {},
      { headers }
    );
  }
}