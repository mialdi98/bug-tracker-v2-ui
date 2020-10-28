import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  // Default.
  role_def = 'Select your Role';
  // Inputs.
  username: string = '';
  password: string = '';
  confirm_password: string = '';
  email: string = '';
  validation = true;

  // Creating form for select.
  roleForm: FormGroup;
  roles = [this.role_def, 'Developer', 'QA', 'Assessor'];
  constructor(
    public httpClient: HttpClient,
    private titleService:Title,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.titleService.setTitle("BT - registration");
    this.roleForm = this.fb.group({
      roles: [this.role_def]
    });
  }

  userValidate() {
    // Rule
    if (this.roleForm.value.roles == this.role_def) {
      this.validation = false;
    }
    // Username
    if (this.username == ''
    || this.username.match(/.{8,}/i) == null) {
      this.validation = false;
    }
    // Password
    if (this.password == ''
    || this.confirm_password == ''
    || this.password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/i) == null
    || this.confirm_password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/i) == null
    || this.password !== this.confirm_password) {
      this.validation = false;
    }
    // Email
    if (this.email == ''
    || this.email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i) == null) {
      this.validation = false;
    }
    return this.validation;
  }

  userCreate() {
    // Post to api and create user.
    if (this.userValidate() === true) {
      const url = 'http://bug-tracker.local/reg';
      const params = new HttpParams()
      .set('username', this.username.toString())
      .set('password', this.password.toString())
      .set('email', this.email.toString())
      .set('role', this.roleForm.value.roles.toString())
      const options = {params: params};
      // Request.
      this.httpClient.get(url,options)
      .subscribe((response)=>{
        if (response !== null && response['status'] == 'Success') {
          // Back to default.
          this.username = "";
          this.password = "";
          this.confirm_password = "";
          this.email = "";
        }
      });
    }
  }
}
