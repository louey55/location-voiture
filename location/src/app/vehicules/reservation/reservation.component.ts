import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
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
    // Convertir le prix en number si c'est une string
    const prix = typeof prixParJour === 'string' ? parseFloat(prixParJour) : prixParJour;
    
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return prix * diffDays;
  }

  loadReservations(): void {
    this.isLoading = true;
    this.sharedService.getReservations().subscribe({
      next: (data: any) => {
        // S'assurer que les données sont bien formatées
        this.reservations = data.map((reservation: any) => ({
          ...reservation,
          vehicle: {
            ...reservation.vehicle,
            image_url: reservation.vehicle?.image_url || 'assets/default-car.jpg',
            prix: reservation.vehicle?.prix || 0
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

  cancelReservation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.sharedService.deleteReservation(id).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== id);
          this.sharedService.updateCartCount();
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
        }
      });
    }
  }
}