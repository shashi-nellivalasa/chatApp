import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accountToken');

  if (token) {
    return true;
  } else {
    router.navigate(['/features/authentication']);
    return false;
  }
};
