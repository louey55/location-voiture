import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehiculesRoutingModule } from './vehicules-routing.module';
import { VehiculeComponent } from './vehicule/vehicule.component';
import { ReservationComponent } from './reservation/reservation.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    VehiculeComponent,
    ReservationComponent
  ],
  imports: [
    CommonModule,
    VehiculesRoutingModule,
        FormsModule,
    
  ]
})
export class VehiculesModule { }
