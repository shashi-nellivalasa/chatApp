import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../../shared/services/authentication';
import { SignUpRequest } from '../../../shared/models/auth-models';
import { Utils } from '../../../shared/services/utils';

@Component({
  selector: 'app-sign-up',
  imports: [FloatLabelModule, CommonModule, FormsModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css'],
})
export class SignUp {
  signUpObject: SignUpRequest = {
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private utils: Utils,
  ) {}

  navToSignIn() {
    this.router.navigate(['features/authentication/sign-in']);
  }

  signUp() {
    // Validation
    if (!this.signUpObject.userName || !this.signUpObject.email || !this.signUpObject.password) {
      console.log('no name');
    }

    if (!this.signUpObject.userName || !this.signUpObject.email || !this.signUpObject.password) {
      this.utils.info('signUp', 'All fields are required.');
      return;
    }

    if (this.signUpObject.password !== this.signUpObject.confirmPassword) {
      this.utils.info('signUp', 'Passwords do not match.');
      return;
    }

    if (this.signUpObject.password.length < 6) {
      this.utils.info('signUp', 'Password must be at least 6 characters.');
      return;
    }

    this.isLoading = true;
    this.authService.signUp(this.signUpObject).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Save token if provided
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          // Navigate to home
          this.router.navigate(['features/home']);
          this.utils.success('Sign Up', response.message || 'Sign up successful');
        } else {
          this.utils.error('Sign Up', response.message || 'Sign up failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.utils.error('Sign Up', error.error?.message || 'An error occurred during sign up');
      },
    });
  }
}
