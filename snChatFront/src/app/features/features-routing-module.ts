import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../shared/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'authentication', pathMatch: 'full' },
  {
    path: 'authentication',
    // dynamic import: path matches existing file `authentication-module.ts`
    loadChildren: () =>
      import('./authentication/authentication-module').then((m) => m.AuthenticationModule),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    // dynamic import: path matches existing file `home-module.ts`
    loadChildren: () => import('./home/home-module').then((m) => m.HomeModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
