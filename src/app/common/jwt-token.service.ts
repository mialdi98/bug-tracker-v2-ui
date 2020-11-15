import { Injectable } from '@angular/core';
import JwtDecode from 'jwt-decode';
import { Router } from '@angular/router';

import { CookieStorageService } from './../common/cookie-storage.service';
import { User } from './../entity/user/user';
 
@Injectable()
export class JWTTokenService {
 
    token: string;
    decodedToken: { [key: string]: any };
 
    constructor(
      private cookie: CookieStorageService,
      private router: Router,
    ) {
      this.token = this.cookie.get('jwt');
    }
 
    setToken(token: string) {
      if (token) {
        this.token = token;
      }
    }

    getToken() {
      this.isTokenAcceptable();
      return this.token;
    }

    getDecodeToken() {
      if (this.token) {
        this.decodedToken = JwtDecode(this.token);
      }
    }
 
    getUser() {
      this.getDecodeToken();
      if (this.decodedToken) {
        return new User(
        Number(this.decodedToken.data.id),
        this.decodedToken.data.username,
        this.decodedToken.data.role);
      }
      else {
        return null;
      }
    }

    isTokenAcceptable() {
      if (
        this.token == null
        || this.isTokenExpired()
      ) {
        this.cookie.remove('jwt');
        this.token = null;
        this.decodedToken = null;
        this.router.navigate(['/index']);
        return false;
      }
      return true;
    }

    getExpiryTime() {
      this.getDecodeToken();
      return this.decodedToken ? Number(this.decodedToken.exp) : null;
    }
 
    isTokenExpired(): boolean {
      const expiryTime: number = this.getExpiryTime();
      if (expiryTime) {
        return ((1000 * expiryTime) - (new Date()).getTime()) < 5000;
      } else {
        return false;
      }
    }
}
