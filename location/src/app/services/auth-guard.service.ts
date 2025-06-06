import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Vérification de la connexion
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/se-connecter']);
      return false;
    }

    const userType = this.authService.getUserType();
    
    // Logique existante pour l'admin (à ne pas modifier)
    if (route.routeConfig?.path === 'admin') {
      if (userType === 'Admin') {
        return true;
      }
      this.router.navigate(['/']);
      return false;
    }

    // Nouvelle logique pour les réservations d'agence (à ajouter)
    if (route.routeConfig?.path === 'agency-reservations') {
      if (userType === 'Agence') {
        return true;
      }
      this.router.navigate(['/']);
      return false;
    }

    // Par défaut, autoriser l'accès pour les autres routes protégées
    return true;
  }
}