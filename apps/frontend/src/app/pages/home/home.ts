import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { IngresoService, Ingreso } from '../../services/ingreso.service.js';
import { GastoService, Gasto } from '../../services/gasto.service.js';

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
  private gastoService = inject(GastoService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly homeApi = 'http://localhost:3000/api/home';

  ingresos: Ingreso[] = [];
  ingresoMes = 0;
  cargando = false;

  gastos: Gasto[] = [];
  cargandoGastos = false;

  saldoDisponible = 0;
  gastosMes = 0;
  presupuesto = 0;

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.cargarResumenHome();
    this.cargarGastosDashboard();
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

  cargarGastosDashboard(): void {
    this.cargandoGastos = true;

    this.gastoService.listar().subscribe({
      next: (data) => {
        this.gastos = data;
        this.cargandoGastos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gastos en el dashboard:', err);
        this.cargandoGastos = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarResumenHome(): void {
    this.http.get<ResumenHome>(this.homeApi).subscribe({
      next: (data) => {
        this.saldoDisponible = data.saldoDisponible;
        this.gastosMes = data.gastado;
        this.presupuesto = data.presupuesto;
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

  get gastosRecientes(): Gasto[] {
    return this.gastos.slice(0, 4);
  }

  get porcentajeGastado(): number {
    if (this.presupuesto <= 0) return 0;
    const porcentaje = (this.gastosMes / this.presupuesto) * 100;
    return Math.min(porcentaje, 100);
  }

  get montoDisponibleGrafica(): number {
    return Math.max(this.presupuesto - this.gastosMes, 0);
  }

  get estiloDona(): string {
    const porcentaje = this.porcentajeGastado;
    return `conic-gradient(#4fd1a1 0% ${porcentaje}%, #9b6de3 ${porcentaje}% 100%)`;
  }

  irANuevoIngreso(): void {
    this.router.navigate(['/ingresos']);
  }

  irANuevoGasto(): void {
    this.router.navigate(['/gastos']);
  }

  irANuevoReporte(): void {
    console.log('Módulo de Reportes: pendiente de implementar');
  }
}