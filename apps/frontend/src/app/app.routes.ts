import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { IngresosComponent } from './pages/ingresos/ingresos';
import { GastosComponent } from './pages/gastos/gastos';

import { authGuard } from './guards/auth.guard';

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

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },

  {
    path: 'ingresos',
    component: IngresosComponent,
    canActivate: [authGuard]
  },

  {
    path: 'gastos',
    component: GastosComponent,
    canActivate: [authGuard]
  }

];
