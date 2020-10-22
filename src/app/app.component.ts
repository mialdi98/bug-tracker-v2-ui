import { Component, OnInit } from '@angular/core';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/JSON' }),
    withCredentials: true
  };

  sendGetRequest(){
      this.httpClient.get('http://bug-tracker.local/auth_is_logged_in').subscribe((res)=>{
          console.log(res);
      });
  }

  login() {
    // if (this.loginValidate() === true) {

      // const body = {username: this.username, password: this.password};
      // this.httpClient.post('http://bug-tracker.local/auth_login', body, this.httpOptions).subscribe(
      // data  => {
      //   console.log(data);
      //   console.log("POST Request is successful ", data);
      // },
      // error  => {
      //   console.log("Error", error);
      // });
      this.httpClient.get('http://bug-tracker.local/auth_login?username='+this.username+'&password='+this.password)
      .subscribe((response)=>{
        console.log(response);
        if (response !== null
        && response['id'] != null
        && response['username'] != null
        && response['role'] != null
        ) {
          const user = new User(response['id'], response['username'], response['role']);
          localStorage.setItem('user', JSON.stringify(user));
        }
      });

      this.isLogin = localStorage.getItem('user') != null;
      this.username = "";
      this.password = "";
      this.modalReference.close('Save click');
    // }
  }

  loginValidate() {
    // Username
    if (this.username == ''
    || this.username.match(/.{8,}/i) == null) {
      // @TODO check of username here
      this.validation = false;
    }
    // Password
    if (this.password == ''
    || this.password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/i) == null) {
      // @TODO check of password here
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
