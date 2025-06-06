import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AdminComponent } from './auth/admin/admin.component';
import { AgencyReservationsComponent } from './core/agency-reservations/agency-reservations.component';

const routes: Routes = [
  { path: "", component: PageHomeComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuardService],
    data: { requiredRole: 'Admin' }
  },
  {
    path: 'agency-reservations',
    component: AgencyReservationsComponent,
    canActivate: [AuthGuardService],
    data: { requiredRole: 'Agence' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }