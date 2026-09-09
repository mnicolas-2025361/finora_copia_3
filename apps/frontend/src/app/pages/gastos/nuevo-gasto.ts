import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastoService, Gasto } from '../../services/gasto.service.js';

@Component({
  selector: 'app-nuevo-gasto',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: ` <div class="modal-overlay">

  <div class="modal-card">

    <h3>Registrar Nuevo Gasto</h3>

    <p class="descripcion-modal">
      Ingresa los detalles de la salida de dinero.
    </p>

    <form (ngSubmit)="guardar()">

      <div class="campo">
        <label for="descripcion">Descripción</label>

        <input
          id="descripcion"
          name="descripcion"
          type="text"
          [(ngModel)]="descripcion"
          placeholder="Ej. Almuerzo, Uber..."
          class="input-finora"
        />
      </div>

      <div class="campo">
        <label for="monto">Monto (Q.)</label>

        <input
          id="monto"
          name="monto"
          type="number"
          step="0.01"
          [(ngModel)]="monto"
          placeholder="0.00"
          class="input-finora"
        />
      </div>

      <div class="campo">
        <label for="fecha">Fecha</label>

        <input
          id="fecha"
          name="fecha"
          type="date"
          [(ngModel)]="fecha"
          class="input-finora"
        />
      </div>

      <div class="campo">
        <label for="categoria">Categoría</label>

        <select
          id="categoria"
          name="categoria"
          [(ngModel)]="categoria"
          class="input-finora"
        >
          <option value="Comida">Comida</option>
          <option value="Transporte">Transporte</option>
          <option value="Vivienda">Vivienda</option>
          <option value="Entretenimiento">Entretenimiento</option>
          <option value="Salud">Salud</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <p *ngIf="error" class="error">
        {{ error }}
      </p>

      <div class="botones">

        <button
          type="button"
          class="boton cancelar"
          (click)="cerrarModalLocal()">
          Cancelar
        </button>

        <button
          type="submit"
          class="boton guardar"
          [disabled]="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar Gasto' }}
        </button>

      </div>

    </form>

  </div>

</div>
`,

  styles: [`
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.70);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-card {
  width: 420px;
  max-width: 100%;
  background: #102f21;
  border: 1px solid #1d4935;
  border-radius: 16px;
  padding: 28px;
  box-sizing: border-box;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-card h3 {
  margin: 0;
  color: white;
  font-size: 24px;
}

.descripcion-modal {
  margin: 8px 0 22px;
  color: #8fa39a;
  font-size: 14px;
}

.campo {
  margin-bottom: 16px;
}

.campo label {
  display: block;
  margin-bottom: 7px;
  color: #d9e5df;
  font-size: 14px;
  font-weight: bold;
}

.input-finora {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  box-sizing: border-box;

  background: #071714;
  border: 1px solid #1d4935;
  border-radius: 8px;

  color: white;
  font-size: 14px;
  outline: none;
}

.input-finora:focus {
  border-color: #138a5e;
  box-shadow: 0 0 0 2px rgba(19, 138, 94, 0.15);
}

.input-finora::placeholder {
  color: #71857c;
}

select.input-finora {
  cursor: pointer;
}

.error {
  margin: 5px 0 15px;
  color: #ff6b6b;
  font-size: 14px;
}

.botones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.boton {
  padding: 11px 17px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.cancelar {
  background: transparent;
  border: 1px solid #1d4935;
  color: #c5d2cc;
}

.cancelar:hover {
  background: #0c2519;
}

.guardar {
  background: #138a5e;
  border: 1px solid #138a5e;
  color: white;
}

.guardar:hover {
  background: #16a66f;
}

.guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 500px) {

  .modal-card {
    padding: 22px;
  }

  .botones {
    flex-direction: column;
  }

  .boton {
    width: 100%;
  }

}
`]
})
export class GastoComponent {

  private gastoService = inject(GastoService);

  descripcion = '';
  monto: number | null = null;
  categoria = 'Comida';
  fecha = new Date().toISOString().split('T')[0];

  guardando = false;
  error: string | null = null;

  @Output() cerrar = new EventEmitter<void>();

  @Output() guardadoExitoso = new EventEmitter<Gasto>();

  guardar(): void {

    this.error = null;

    if (!this.descripcion.trim()) {
      this.error = 'La descripción es obligatoria.';
      return;
    }

    if (
      this.monto === null ||
      this.monto === undefined ||
      Number(this.monto) <= 0
    ) {
      this.error = 'Ingresa un monto mayor a cero.';
      return;
    }

    this.guardando = true;

    this.gastoService.crear({
      descripcion: this.descripcion.trim(),
      monto: Number(this.monto),
      categoria: this.categoria,
      fecha: this.fecha
    }).subscribe({

      next: (creado) => {

        this.guardando = false;

        this.guardadoExitoso.emit(creado);

        this.limpiarFormulario();
      },

      error: (err) => {

        this.guardando = false;

        this.error =
          err?.error?.mensaje ??
          'No se pudo guardar el gasto. Intenta de nuevo.';

        console.error(
          'Error al guardar el gasto:',
          err
        );
      }

    });

  }

  cerrarModalLocal(): void {

    this.limpiarFormulario();

    this.cerrar.emit();

  }

  private limpiarFormulario(): void {
    this.descripcion = '';
    this.monto = null;
    this.categoria = 'Comida';
    this.fecha = new Date().toISOString().split('T')[0];
    this.error = null;
  }

}