import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageHomeComponent } from './pages/page-home/page-home.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AdminComponent } from './auth/admin/admin.component';

const routes: Routes = [
  {     path:"" , component: PageHomeComponent  },
  { 
        path: 'admin', 
        component: AdminComponent,
        canActivate: [AuthGuardService] 
  }
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
