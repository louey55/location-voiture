import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeComponent } from './vehicule/vehicule.component';
import { ReservationComponent } from './reservation/reservation.component';

const routes: Routes = [
      {path:"vehicule",component:VehiculeComponent},
      {path:"reservation",component:ReservationComponent}

      
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculesRoutingModule { }
