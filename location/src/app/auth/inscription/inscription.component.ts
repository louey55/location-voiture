import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  hero = {
    Nom: '',
    Prenom: '',
    Email: '',
    Mot_De_Passe: '',
    Date_De_Naissance: '',
    Ooption: '',
    NomAgence: '',
    AdresseAgence: ''
  };

  showAgencyFields = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onUserTypeChange(): void {
    this.showAgencyFields = this.hero.Ooption === 'Agence';
  }

  ajout() {
    const userData = {
      username: this.hero.Email,
      email: this.hero.Email,
      password: this.hero.Mot_De_Passe,
      first_name: this.hero.Prenom,
      last_name: this.hero.Nom,
      user_type: this.hero.Ooption,
      date_of_birth: this.hero.Date_De_Naissance,
      agency_name: this.hero.NomAgence,
      agency_address: this.hero.AdresseAgence
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);
        this.resetForm();
        this.router.navigate(['/se-connecter']);
      },
      error: (error) => {
        console.error("Erreur d'inscription", error);
      }
    });
  }

  resetForm(): void {
    this.hero = {
      Nom: '',
      Prenom: '',
      Email: '',
      Mot_De_Passe: '',
      Date_De_Naissance: '',
      Ooption: '',
      NomAgence: '',
      AdresseAgence: ''
    };
    this.showAgencyFields = false;
  }
}