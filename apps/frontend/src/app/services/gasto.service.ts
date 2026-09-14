import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Gasto {
    id: number;
    usuario_id?: number;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
}

// Lo que enviamos al crear (sin id, lo genera la base de datos)
export type NuevoGasto = Omit<Gasto, 'id' | 'usuario_id'>;

@Injectable({ providedIn: 'root' })
export class GastoService {
    private http = inject(HttpClient);

    // Misma convencion que IngresoService: una sola fuente de verdad para la URL.
    private readonly api = 'http://localhost:3000/api/gastos';

    listar(): Observable<Gasto[]> {
        return this.http.get<Gasto[]>(this.api);
    }

    crear(gasto: NuevoGasto): Observable<Gasto> {
        return this.http.post<Gasto>(this.api, gasto);
    }

    eliminar(id: number): Observable<{ mensaje: string }> {
        return this.http.delete<{ mensaje: string }>(`${this.api}/${id}`);
    }
}