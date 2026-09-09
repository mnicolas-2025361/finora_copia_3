import { RouterLink } from '@angular/router';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { IngresoService, Ingreso } from '../../services/ingreso.service.js';

interface ResumenHome {
  presupuesto: number;
  gastado: number;
  saldoDisponible: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
    imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private ingresoService = inject(IngresoService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly homeApi = 'http://localhost:3000/api/home';

  ingresos: Ingreso[] = [];
  ingresoMes = 0;
  cargando = false;

  saldoDisponible = 0;
  gastosMes = 0;

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.cargarResumenHome();
  }

  cargarDatosDashboard(): void {
    this.cargando = true;

    this.ingresoService.listar().subscribe({
      next: (data) => {
        this.ingresos = data;
        this.calcularIngresoMes();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ingresos en el dashboard:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarResumenHome(): void {
    this.http.get<ResumenHome>(this.homeApi).subscribe({
      next: (data) => {
        this.saldoDisponible = data.saldoDisponible;
        this.gastosMes = data.gastado;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el resumen del home:', err);
        this.cdr.detectChanges();
      }
    });
  }

  calcularIngresoMes(): void {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    this.ingresoMes = this.ingresos
      .filter((ingreso) => {
        const fecha = new Date(ingreso.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
      })
      .reduce((total, ingreso) => total + Number(ingreso.monto), 0);
  }

  irANuevoIngreso(): void {
    this.router.navigate(['/ingresos']);
  }

    irANuevoGasto(): void {
    this.router.navigate(['/gastos']);
  }
}