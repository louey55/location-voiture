import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  annonces: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.isLoggedIn() && this.authService.getUserType() === 'Admin';
    if (!isAdmin) {
      this.router.navigate(['/']);
    }
    this.loadPendingAnnonces();
}

  loadPendingAnnonces(): void {
    this.isLoading = true;
    this.adminService.getPendingAnnonces().subscribe({
      next: (data) => {
        this.annonces = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des annonces';
        this.isLoading = false;
      }
    });
  }

  approveAnnonce(id: number): void {
    this.adminService.approveAnnonce(id).subscribe({
      next: () => {
        this.annonces = this.annonces.filter(a => a.id !== id);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'approbation';
      }
    });
  }

  rejectAnnonce(id: number): void {
    this.adminService.rejectAnnonce(id).subscribe({
      next: () => {
        this.annonces = this.annonces.filter(a => a.id !== id);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du rejet';
      }
    });
  }
}