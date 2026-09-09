import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GastoComponent } from './nuevo-gasto';
import { GastoService, Gasto } from '../../services/gasto.service.js';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, GastoComponent],
  templateUrl: './gastos.html',
  styleUrl: './gastos.css'
})
export class GastosComponent implements OnInit {

  private gastoService = inject(GastoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  gastos: Gasto[] = [];

  mostrarModal = false;
  cargando = false;
  error: string | null = null;

  totalGastos = 0;
  gastoMes = 0;

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.cargando = true;
    this.error = null;

    this.gastoService.listar().subscribe({
      next: (data) => {
        this.gastos = data;
        this.calcularTotales();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.mensajeError(err, 'No se pudo cargar la lista de gastos');
        this.cargando = false;
        console.error('Error al cargar los gastos:', err);
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotales(): void {
    this.totalGastos = this.gastos.reduce(
      (total, gasto) => total + Number(gasto.monto),
      0
    );

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    this.gastoMes = this.gastos
      .filter((gasto) => {
        const fecha = new Date(gasto.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
      })
      .reduce((total, gasto) => total + Number(gasto.monto), 0);
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  gastoGuardado(nuevo: Gasto): void {
    this.gastos = [nuevo, ...this.gastos];
    this.calcularTotales();
    this.cerrarModal();
    this.cdr.detectChanges();
  }

  eliminarGasto(id: number): void {
    if (!confirm('Seguro que deseas eliminar este gasto?')) {
      return;
    }

    this.gastoService.eliminar(id).subscribe({
      next: () => {
        this.gastos = this.gastos.filter((g) => g.id !== id);
        this.calcularTotales();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.mensajeError(err, 'No se pudo eliminar el gasto');
        console.error('Error al eliminar:', err);
        this.cdr.detectChanges();
      }
    });
  }

  irANuevoGasto(): void {
    this.router.navigate(['/gastos']);
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