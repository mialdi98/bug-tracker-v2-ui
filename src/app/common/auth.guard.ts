import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { JWTTokenService } from './../common/jwt-token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private jwt: JWTTokenService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.jwt.isTokenAcceptable()) {
      // Authorised so return true.
      return true;
    }
    // Not logged in so redirect.
    this.router.navigate(['/index']);
    return false;
  }
}