import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { IngresosComponent } from './pages/ingresos/ingresos';
import { GastosComponent } from './pages/gastos/gastos';
  
export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },


  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },


  {
    path: 'ingresos',
    component: IngresosComponent
  },

  {
    path: 'gastos',
    component: GastosComponent
  }

];