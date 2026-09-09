import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IngresoService, Ingreso } from '../../services/ingreso.service.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private ingresoService = inject(IngresoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ingresos: Ingreso[] = [];
  ingresoMes = 0;
  cargando = false;

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.cargando = true;

    this.ingresoService.listar().subscribe({
      next: (data) => {
        this.ingresos = data;
        this.calcularIngresoMes();
        this.cargando = false;
        this.cdr.detectChanges(); // fuerza el refresco de la vista
      },
      error: (err) => {
        console.error('Error al cargar ingresos en el dashboard:', err);
        this.cargando = false;
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
}