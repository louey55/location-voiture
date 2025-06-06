import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicule',
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.css']
})
export class VehiculeComponent implements OnInit {
  vehicles: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  expandedCardId: number | null = null;
  reservationData: any = {
    date_debut: '',
    date_fin: '',
    telephone: ''
  };
  searchText: string = '';

  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.sharedService.getAnnonces().subscribe({
      next: (data) => {
        this.vehicles = this.formatVehicleData(data);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de charger les véhicules. Veuillez réessayer.';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  private formatVehicleData(data: any): any[] {
    if (!data) return [];
    
    return data.map((vehicle: any) => ({
      ...vehicle,
      image: vehicle.image_url || 'assets/default-car.jpg'
    }));
  }

  toggleReservationForm(vehicleId: number): void {
    this.expandedCardId = this.expandedCardId === vehicleId ? null : vehicleId;
  }

  reserveVehicle(vehicleId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/se-connecter']);
      return;
    }

    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const reservation = {
      vehicle: vehicleId,
      date_debut: this.reservationData.date_debut,
      date_fin: this.reservationData.date_fin,
      telephone: this.reservationData.telephone
    };

    this.sharedService.createReservation(reservation).subscribe({
      next: (response) => {
        this.expandedCardId = null;
        this.reservationData = { date_debut: '', date_fin: '', telephone: '' };
        // Mettre à jour le panier dans le service
        this.sharedService.updateCartCount();
      },
      error: (error) => {
        console.error('Erreur lors de la réservation:', error);
      }
    });
  }

  filteredVehicles() {
    if (!this.searchText) return this.vehicles;
    const txt = this.searchText.toLowerCase();
    return this.vehicles.filter(v =>
      (v.marque && v.marque.toLowerCase().includes(txt)) ||
      (v.modele && v.modele.toLowerCase().includes(txt)) ||
      (v.nom && v.nom.toLowerCase().includes(txt))
    );
  }
}