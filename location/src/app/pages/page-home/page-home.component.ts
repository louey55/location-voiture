import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.css']
})
export class PageHomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSeeMoreClick(): void {
    if (this.authService.isLoggedIn()) {
      // Redirection directe vers la page du composant véhicule
      this.router.navigate(['/vehicule']); // Notez le chemin '/vehicule' (singulier)
    } else {
      // Redirection vers la page de connexion
      this.router.navigate(['/se-connecter']);
    }
  }

}
