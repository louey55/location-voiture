import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { AgencyReservationsComponent } from './agency-reservations/agency-reservations.component';


@NgModule({
  declarations: [
    NavbarComponent,
    AgencyReservationsComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  exports: [
    NavbarComponent 
   ]
})
export class CoreModule { }
