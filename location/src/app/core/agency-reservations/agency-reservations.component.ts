import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agency-reservations',
  templateUrl: './agency-reservations.component.html',
  styleUrls: ['./agency-reservations.component.css']
})
export class AgencyReservationsComponent implements OnInit {
  reservations: any[] = [];
  isLoading: boolean = true;

  constructor(
    private sharedService: SharedService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  calculateTotal(prixParJour: number | string, dateDebut: string, dateFin: string): number {
    const prix = typeof prixParJour === 'string' ? parseFloat(prixParJour) : prixParJour;
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return prix * diffDays;
  }

  loadReservations(): void {
    this.isLoading = true;
    this.sharedService.getAgencyReservations().subscribe({
      next: (data: any) => {
        this.reservations = data.map((reservation: any) => ({
          ...reservation,
          vehicle: {
            marque: reservation.vehicle_marque,
            modele: reservation.vehicle_modele,
            prix: reservation.vehicle_prix,
            image_url: reservation.vehicle_image_url || 'assets/default-car.jpg'
          },
          client: {
            first_name: reservation.client_first_name,
            last_name: reservation.client_last_name,
            email: reservation.client_email
          }
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.isLoading = false;
      }
    });
  }

  confirmReservation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir confirmer cette réservation ?')) {
      const headers = this.sharedService.getJsonAuthHeaders();
      this.sharedService.http.patch(
        `${this.sharedService.getApiUrl()}/api/reservations/${id}/confirm/`, 
        {}, 
        { headers }
      ).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (error) => {
          console.error('Erreur lors de la confirmation:', error);
        }
      });
    }
  }
}