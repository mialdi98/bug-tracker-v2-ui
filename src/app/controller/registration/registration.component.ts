import { Component, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";

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
    console.log('all got info:');
    if (this.userValidate() === true) {
      // Post to api and create user.
      console.log(this.roleForm.value.roles);
      console.log(this.username);
      console.log(this.password);
      console.log(this.confirm_password);
      console.log(this.email);
    }
  }

}
