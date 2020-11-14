import { Component, OnInit } from '@angular/core';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { GlobalConstants } from './common/global-constants';
import { User } from './entity/user/user';

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
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isLogin = localStorage.getItem('user') != null;
  }

  async loginRequest() {
    // Set values to send.
    const url = GlobalConstants.apiURL+'auth_login';
    const body = JSON.stringify({
      username: this.username,
      password: this.password
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null
        && data['id'] != null
        && data['username'] != null
        && data['role'] != null
        ) {
          const user = new User(data['id'], data['username'], data['role']);
          localStorage.setItem('user', JSON.stringify(user));
          this.isLogin = localStorage.getItem('user') != null;
          // Clear values.
          this.username = "";
          this.password = "";
        }
      }
    ).catch(error => console.log(error.message));
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
    localStorage.clear();
    this.isLogin = false;
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
