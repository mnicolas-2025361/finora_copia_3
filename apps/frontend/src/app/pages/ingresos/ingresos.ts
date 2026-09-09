import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ingresoComponent } from './nuevo-ingreso';
import { IngresoService, Ingreso } from '../../services/ingreso.service.js';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, ingresoComponent, RouterLink],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css'
})
export class IngresosComponent implements OnInit {

  private ingresoService = inject(IngresoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ingresos: Ingreso[] = [];

  mostrarModal = false;
  cargando = false;
  error: string | null = null;

  totalIngresos = 0;
  ingresoMes = 0;

  ngOnInit(): void {
    this.cargarIngresos();
  }

  cargarIngresos(): void {
    this.cargando = true;
    this.error = null;

    this.ingresoService.listar().subscribe({
      next: (data) => {
        this.ingresos = data;
        this.calcularTotales();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.mensajeError(err, 'No se pudo cargar la lista de ingresos');
        this.cargando = false;
        console.error('Error al cargar los ingresos:', err);
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotales(): void {
    this.totalIngresos = this.ingresos.reduce(
      (total, ingreso) => total + Number(ingreso.monto),
      0
    );

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

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  ingresoGuardado(nuevo: Ingreso): void {
    this.ingresos = [nuevo, ...this.ingresos];
    this.calcularTotales();
    this.cerrarModal();
    this.cdr.detectChanges();
  }

  eliminarIngreso(id: number): void {
    if (!confirm('Seguro que deseas eliminar este ingreso?')) {
      return;
    }

    this.ingresoService.eliminar(id).subscribe({
      next: () => {
        this.ingresos = this.ingresos.filter((i) => i.id !== id);
        this.calcularTotales();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.mensajeError(err, 'No se pudo eliminar el ingreso');
        console.error('Error al eliminar:', err);
        this.cdr.detectChanges();
      }
    });
  }

  irANuevoIngreso(): void {
    this.router.navigate(['/ingreso']);
  }

  private mensajeError(err: any, base: string): string {
    if (err?.status === 0) {
      return `${base}: el servidor no responde (revisa que el backend este encendido).`;
    }
    if (err?.status === 401) {
      return `${base}: tu sesion expiro, vuelve a iniciar sesion.`;
    }
    return `${base} (error ${err?.status ?? 'desconocido'}).`;
  }
}