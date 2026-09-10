import { Component } from '@angular/core';

import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-session-warning-modal',
  imports: [],
  templateUrl: './session-warning-modal.html',
  styleUrl: './session-warning-modal.css'
})
export class SessionWarningModal {

  constructor(public inactivityService: InactivityService) {}

  onStayConnected(): void {
    this.inactivityService.extendSession();
  }

  onLogoutNow(): void {
    this.inactivityService.logoutNow();
  }
}