import { Component, OnInit, HostListener } from '@angular/core';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  login() {
    // if (this.loginValidate() === true) {
    const url = 'http://bug-tracker.local/auth_login';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams()
    .set('username', this.username.toString())
    .set('password', this.password.toString());
    const options = {params: params, headers: headers};
    this.httpClient.get(url, options).subscribe((response)=>{
        if (response !== null
        && response['id'] != null
        && response['username'] != null
        && response['role'] != null
        ) {
          const user = new User(response['id'], response['username'], response['role']);
          localStorage.setItem('user', JSON.stringify(user));
          this.isLogin = localStorage.getItem('user') != null;
          this.username = "";
          this.password = "";
        }
      });
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
