import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignInRequest } from '../../../shared/models/auth-models';
import { Utils } from '../../../shared/services/utils';
import { AuthenticationService } from '../../../shared/services/authentication';

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
          this.utils.success('Sign In', res.message || 'Signed in');
          // navigate to home or main chat
          this.router.navigate(['/features/home']);
        },
        error: (err) => {
          console.error('signIn error', err);
          this.utils.error('Sign In', err?.error?.message || err?.message || 'Sign in failed');
        },
      });
    }
  }
}
