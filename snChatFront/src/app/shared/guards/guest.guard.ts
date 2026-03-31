import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accountToken');
  if (token) {
    // If user is already logged in, redirect to home
    router.navigate(['/features/home']);
    return false;
  } else {
    // Allow access to sign-in/sign-up for guests
    return true;
  }
};
