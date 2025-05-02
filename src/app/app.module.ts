import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { PagesModule } from './pages/pages.module';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { AnnoncesModule } from './annonces/annonces.module';
import { VehiculesModule } from './vehicules/vehicules.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    PagesModule,
    AuthModule,
    HttpClientModule,
    AnnoncesModule,
    VehiculesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
