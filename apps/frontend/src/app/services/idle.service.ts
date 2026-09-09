import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  // Tiempo máximo de inactividad:
  // 10 minutos = 10 * 60 * 1000 milisegundos
  private readonly idleTime = 10 * 60 * 1000;

  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router
  ) {}

  startWatching(): void {

    // Eventos que consideramos actividad del usuario
    const events = [
      'click',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    events.forEach((event) => {
      window.addEventListener(
        event,
        this.resetTimer
      );
    });

    // Empezamos a contar desde este momento
    this.resetTimer();
  }

  stopWatching(): void {

    const events = [
      'click',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    events.forEach((event) => {
      window.removeEventListener(
        event,
        this.resetTimer
      );
    });

    this.clearTimer();
  }

  private resetTimer = (): void => {

    this.clearTimer();

    this.idleTimer = setTimeout(() => {
      this.handleIdle();
    }, this.idleTime);
  };

  private clearTimer(): void {

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private handleIdle(): void {

    this.clearTimer();

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    localStorage.setItem(
      'sessionExpired',
      'true'
    );

    this.router.navigate(['/login']);
  }
}