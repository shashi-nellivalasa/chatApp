import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignInRequest } from '../../../shared/models/auth-models';
import { Utils } from '../../../shared/services/utils.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { SocketService } from '../../../shared/services/socket.service';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule, FloatLabelModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css'],
})
export class SignIn {
  signInObject: SignInRequest = {
    email: '',
    password: '',
  };

  constructor(
    private router: Router,
    private utils: Utils,
    private AuthenticationService: AuthenticationService,
    private socketService: SocketService
  ) {}

  navToSignUp() {
    this.router.navigate(['features/authentication/sign-up']);
  }

  signIn() {
    if (!this.signInObject.email || !this.signInObject.password) {
      console.log('All fields are mandatory');
      this.utils.warn('signIn', 'All fields are mandatory');
      return;
    } else {
      this.AuthenticationService.signIn(this.signInObject).subscribe({
        next: (res) => {
          console.log(res.token);
          if (res.token) {
            localStorage.setItem('accountToken', res.token);
            this.socketService.connectSocket(); // Reconnect Socket.io using the fresh token
          }
          this.utils.success('Sign In', res.message || 'Signed in'); //Toast message
          this.router.navigate(['/features/home']); // navigate to home or main chat
        },
        error: (err) => {
          console.error('signIn error', err);
          this.utils.error('Sign In', err?.error?.message || err?.message || 'Sign in failed');
        },
      });
    }
  }
}
