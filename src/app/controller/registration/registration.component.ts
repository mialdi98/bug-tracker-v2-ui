import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';

import { GlobalConstants } from '../../common/global-constants';

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
    if (this.userValidate() === true) {
    // Set values to send.
    const url = GlobalConstants.apiURL+'reg';
    const body = JSON.stringify({
      username: this.username,
      password: this.password,
      email: this.email,
      role: this.roleForm.value.roles
    });
    // Request.
    this.httpClient.post(url,body)
    .subscribe({
      next: data => {
        if (data !== null && data['status'] == 'Success') {
          // Back to default.
          this.username = "";
          this.password = "";
          this.confirm_password = "";
          this.email = "";
        }
      },
      error: error => {
        console.error('Error', error);
      }
    });
    }
  }
}
