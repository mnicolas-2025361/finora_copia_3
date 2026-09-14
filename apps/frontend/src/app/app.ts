import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from './services/auth.service';
import { InactivityService } from './services/inactivity.service';
import { SessionWarningModal } from './components/session-warning-modal/session-warning-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionWarningModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this.inactivityService.start();
        } else {
          this.inactivityService.stop();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}