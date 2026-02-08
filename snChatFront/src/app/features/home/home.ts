import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '../../shared/services/utils';
import { AuthenticationService } from '../../shared/services/authentication';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(
    private router: Router,
    private utils: Utils,
    private AuthenticationService: AuthenticationService,
  ) {}
  signOut() {
    this.AuthenticationService.logout().subscribe({
      next: (res) => {
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
