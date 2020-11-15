import { Component, OnInit } from '@angular/core';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { JWTTokenService } from './common/jwt-token.service';
import { CookieStorageService } from './common/cookie-storage.service';
import { GlobalConstants as global } from './common/global-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Icons
  faSignInAlt = faSignInAlt;
  faSignOutAlt = faSignOutAlt;
  // Modal
  modalReference: NgbModalRef;
  closeResult: string;
  isLogin: boolean = false;
  // Inputs.
  username: string = '';
  password: string = '';
  
  validation = true;

  constructor(
    public httpClient: HttpClient,
    private cookie: CookieStorageService,
    private jwt: JWTTokenService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isLoginF();
  }

  isLoginF() {
    this.isLogin = this.jwt.isTokenAcceptable();
  }

  async loginRequest() {
    // Set values to send.
    const url = global.apiURL+'auth_login';
    const body = JSON.stringify({
      username: this.username,
      password: this.password
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null
        && data['jwt'] != null
        ) {
          this.cookie.set('jwt', data['jwt']);
          this.jwt.setToken(this.cookie.get('jwt'));
          this.isLogin = this.jwt.isTokenAcceptable();
        }
      }
    ).catch(error => console.log(error.message));
    // Clear values.
    this.username = "";
    this.password = "";
  }

  login() {
    // if (this.loginValidate() === true) {
    this.loginRequest();
    this.modalReference.close('Save click');
    // }
  }

  loginValidate() {
    // Username
    if (this.username == ''
    || this.username.match(/.{8,}/i) == null) {
      this.validation = false;
    }
    // Password
    if (this.password == ''
    || this.password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/i) == null) {
      this.validation = false;
    }
    return this.validation;
  }

  logout() {
    this.isLogin = false;
    this.cookie.remove('jwt');
    this.router.navigate(['/index']);
  }

  openModal(content) {
    this.modalReference = this.modalService.open(content);
  }

  open(content) {
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
