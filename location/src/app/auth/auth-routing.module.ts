import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeConnecterComponent } from './se-connecter/se-connecter.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuardService } from '../services/auth-guard.service';

const routes: Routes = [
  {path:"se-connecter" ,component:SeConnecterComponent  },
  {path:"inscription" ,component:InscriptionComponent  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
