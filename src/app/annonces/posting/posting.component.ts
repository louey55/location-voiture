import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posting',
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.css']
})
export class PostingComponent implements OnInit {
  annonce = {
    marque: '',
    modele: '',
    matricule: '',
    moteur: '',
    puissance: null as number | null,
    prix: null as number | null,
    zone: '',
    image: null as File | null
  };

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté ET est une agence
    if (!this.authService.isLoggedIn() || this.authService.getUserType() !== 'Agence') {
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.errorMessage = '';
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La taille de l\'image ne doit pas dépasser 5MB';
        event.target.value = '';
        return;
      }
      
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        this.errorMessage = 'Seules les images (JPEG, JPG, PNG) sont autorisées';
        event.target.value = '';
        return;
      }
      
      this.annonce.image = file;
    }
  }

  creerAnnonce(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('marque', this.annonce.marque);
    formData.append('modele', this.annonce.modele);
    formData.append('matricule', this.annonce.matricule);
    formData.append('moteur', this.annonce.moteur);
    formData.append('puissance', String(this.annonce.puissance));
    formData.append('prix', String(this.annonce.prix));
    formData.append('zone', this.annonce.zone);
    
    if (this.annonce.image) {
      formData.append('image', this.annonce.image);
    }

    this.sharedService.addAnnonce(formData).subscribe({
      next: () => {
        this.successMessage = 'Annonce publiée avec succès!';
        this.isLoading = false;
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        
        if (err.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier les informations.';
        } else if (err.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout();
          this.router.navigate(['/se-connecter']);
        } else {
          this.errorMessage = 'Erreur lors de la publication. Veuillez réessayer.';
        }
      }
    });
  }

  private isFormValid(): boolean {
    return (
      !!this.annonce.marque &&
      !!this.annonce.modele &&
      !!this.annonce.matricule &&
      !!this.annonce.moteur &&
      this.annonce.puissance !== null &&
      this.annonce.prix !== null &&
      !!this.annonce.zone &&
      !!this.annonce.image
    );
  }
}