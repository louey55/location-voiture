import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostingComponent } from './posting/posting.component';

const routes: Routes = [
  {path:"publier-annonce" ,component:PostingComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnoncesRoutingModule { }
