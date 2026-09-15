import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Tipos mínimos para el objeto global que agrega el script de Google
declare const google: any;

const GOOGLE_CLIENT_ID = '1040712001671-b6oca8pc4ke1scpr8cisphjig4153vdt.apps.googleusercontent.com';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, AfterViewInit {

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLDivElement>;

  email = '';
  password = '';

  errorMessage = '';
  sessionExpired = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const expired =
      localStorage.getItem('sessionExpired');

    if (expired === 'true') {

      this.sessionExpired = true;

      localStorage.removeItem(
        'sessionExpired'
      );
    }
  }

  ngAfterViewInit(): void {
    this.inicializarBotonGoogle();
  }

  private inicializarBotonGoogle(): void {

    if (typeof google === 'undefined') {
      // El script de Google todavía no cargó, reintenta en un momento
      setTimeout(() => this.inicializarBotonGoogle(), 300);
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        this.loginConGoogle(response.credential);
      }
    });

    google.accounts.id.renderButton(
      this.googleBtn.nativeElement,
      {
        theme: 'filled_black',
        size: 'large',
        width: 320,
        shape: 'pill'
      }
    );
  }

  private loginConGoogle(idToken: string): void {

    this.errorMessage = '';

    this.auth.loginWithGoogle(idToken).subscribe({

      next: () => {
        this.router.navigate(['/home']);
      },

      error: (error) => {
        console.error('Error de login con Google:', error);

        this.errorMessage =
          error.error?.message ||
          'No se pudo iniciar sesión con Google';
      }

    });
  }

  login(): void {

    this.errorMessage = '';
    this.sessionExpired = false;

    this.auth.login(
      this.email,
      this.password
    ).subscribe({

      next: () => {

        this.router.navigate(['/home']);

      },

      error: (error) => {

        console.error(
          'Error de login:',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Correo o contraseña incorrectos';
      }

    });
  }

  goToRegister(): void {

    this.router.navigate(['/register']);

  }
}