import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { GastoService, Gasto } from '../../services/gasto.service';
import { IngresoService, Ingreso } from '../../services/ingreso.service';

interface MovimientoMensual {
  name: string;
  series: { name: string; value: number }[];
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})

export class Reportes implements OnInit {

  private gastoService = inject(GastoService);
  private ingresoService = inject(IngresoService);

  private readonly meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                             'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Antes eran propiedades normales; ahora son signals
  datosGrafica = signal<MovimientoMensual[]>([]);
  cargando = signal(true);
  huboError = signal(false);

  colorScheme: Color = {
    name: 'finora',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4ade80', '#f87171']
  };

  view: [number, number] = [700, 350];

  ngOnInit(): void {
    this.ingresoService.listar().subscribe({
      next: (ingresos) => {
        this.gastoService.listar().subscribe({
          next: (gastos) => {
            this.datosGrafica.set(this.agruparPorMes(ingresos, gastos));
            this.cargando.set(false);
          },
          error: () => this.manejarError()
        });
      },
      error: () => this.manejarError()
    });
  }

  private agruparPorMes(ingresos: Ingreso[], gastos: Gasto[]): MovimientoMensual[] {
    const resumen: { [mes: string]: { ingreso: number; gasto: number } } = {};

    ingresos.forEach(i => {
      const mes = this.meses[new Date(i.fecha).getMonth()];
      resumen[mes] ??= { ingreso: 0, gasto: 0 };
      resumen[mes].ingreso += Number(i.monto);
    });

    gastos.forEach(g => {
      const mes = this.meses[new Date(g.fecha).getMonth()];
      resumen[mes] ??= { ingreso: 0, gasto: 0 };
      resumen[mes].gasto += Number(g.monto);
    });

    return this.meses
      .filter(mes => resumen[mes])
      .map(mes => ({
        name: mes,
        series: [
          { name: 'Ingresos', value: resumen[mes].ingreso },
          { name: 'Gastos', value: resumen[mes].gasto }
        ]
      }));
  }

  private manejarError(): void {
    this.huboError.set(true);
    this.cargando.set(false);
  }
}