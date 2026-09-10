import { Injectable, NgZone, signal } from '@angular/core';

import { AuthService } from './auth.service';

// Tiempo de inactividad antes de mostrar el aviso
const INACTIVITY_TIMEOUT = 10 * 1000; // 10 segundos

// Tiempo de gracia con cuenta regresiva antes de cerrar sesión
const GRACE_TIMEOUT = 10 * 1000; // 10 segundos

// Eventos que cuentan como actividad del usuario
const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'click',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart'
];

// Eventos "deliberados": los únicos que cuentan como actividad
// mientras el modal de aviso está abierto. Mover el mouse hacia el
// botón no debe cerrar el modal antes de poder hacer clic.
const DECISIVE_EVENTS = ['click', 'keydown', 'touchstart'];

// Evita reiniciar el timer en cada pixel de mousemove/scroll
const THROTTLE_MS = 300;

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  // El template del modal lee estas señales directamente
  readonly showWarning = signal(false);
  readonly remainingSeconds = signal(0);

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private graceTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  private lastActivityTimestamp = 0;
  private isRunning = false;

  private readonly boundOnActivity = this.onActivity.bind(this);

  constructor(
    private ngZone: NgZone,
    private authService: AuthService
  ) {}

  /** Arranca la detección de actividad. Llamar una vez al iniciar sesión. */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastActivityTimestamp = Date.now();

    // Los listeners corren fuera de Angular para no disparar detección
    // de cambios en cada movimiento de mouse o scroll.
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        document.addEventListener(eventName, this.boundOnActivity, {
          passive: true
        });
      });
    });

    this.resetInactivityTimer();
  }

  /** Detiene toda detección y limpia los timers. Llamar en logout. */
  stop(): void {
    this.isRunning = false;

    ACTIVITY_EVENTS.forEach((eventName) => {
      document.removeEventListener(eventName, this.boundOnActivity);
    });

    this.clearInactivityTimer();
    this.clearGraceTimer();

    this.showWarning.set(false);
    this.remainingSeconds.set(0);
  }

  /** El modal llama esto cuando el usuario elige "Seguir conectado". */
  extendSession(): void {
    this.lastActivityTimestamp = 0; // fuerza que la próxima señal cuente

    // Llamada directa desde un (click) del botón: es en sí misma un
    // evento deliberado, así que la tratamos como 'click'.
    this.onActivity(new Event('click'));
  }

  /** El modal llama esto cuando el usuario elige cerrar sesión ya mismo. */
  logoutNow(): void {
    this.ngZone.run(() => {
      this.stop();
      this.authService.logout();
    });
  }

  private onActivity(event: Event): void {
    if (!this.isRunning) {
      return;
    }

    // Mientras el modal de aviso está visible, solo los eventos
    // deliberados (click, tecla, touch) cuentan como "seguir conectado".
    // 'mousemove' y 'scroll' se ignoran aquí para que el usuario pueda
    // mover el mouse hacia el botón sin que el modal se cierre antes
    // de poder hacer clic en él.
    if (this.showWarning() && !DECISIVE_EVENTS.includes(event.type)) {
      return;
    }

    const now = Date.now();

    if (now - this.lastActivityTimestamp < THROTTLE_MS) {
      return;
    }

    this.lastActivityTimestamp = now;

    if (this.showWarning()) {
      this.ngZone.run(() => {
        this.clearGraceTimer();
        this.showWarning.set(false);
        this.remainingSeconds.set(0);
      });
    }

    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();

    this.inactivityTimer = setTimeout(() => {
      this.startGracePeriod();
    }, INACTIVITY_TIMEOUT);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private startGracePeriod(): void {
    this.ngZone.run(() => {
      this.showWarning.set(true);
      this.remainingSeconds.set(Math.floor(GRACE_TIMEOUT / 1000));

      this.countdownInterval = setInterval(() => {
        const current = this.remainingSeconds();

        if (current <= 1) {
          this.remainingSeconds.set(0);
          this.clearCountdownInterval();
        } else {
          this.remainingSeconds.set(current - 1);
        }
      }, 1000);

      this.graceTimer = setTimeout(() => {
        this.expireSession();
      }, GRACE_TIMEOUT);
    });
  }

  private clearGraceTimer(): void {
    if (this.graceTimer) {
      clearTimeout(this.graceTimer);
      this.graceTimer = null;
    }
    this.clearCountdownInterval();
  }

  private clearCountdownInterval(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private expireSession(): void {
    this.ngZone.run(() => {
      this.stop();
      this.authService.logout();
    });
  }
}