import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Utils } from '../../shared/services/utils.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { SocketService } from '../../shared/services/socket.service';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(
    private router: Router,
    private utils: Utils,
    private AuthenticationService: AuthenticationService,
    private socketService: SocketService,
  ) {}
  signOut() {
    this.AuthenticationService.signOut().subscribe({
      next: (res) => {
        localStorage.removeItem('accountToken');
        this.socketService.disconnect(); // Disconnect socket
        this.utils.warn('Log out', res.message || 'Logged Out');
        // navigate to home or main chat
        this.router.navigate(['/features/authentication']);
      },
      error: (err) => {
        console.error('signIn error', err);
        this.utils.error('Sign In', err?.error?.message || err?.message || 'Sign in failed');
      },
    });
  }
}
