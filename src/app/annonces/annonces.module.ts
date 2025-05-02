import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnoncesRoutingModule } from './annonces-routing.module';
import { PostingComponent } from './posting/posting.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PostingComponent,
  ],
  imports: [
    CommonModule,
    AnnoncesRoutingModule,
    FormsModule,
  ]
})
export class AnnoncesModule { }
