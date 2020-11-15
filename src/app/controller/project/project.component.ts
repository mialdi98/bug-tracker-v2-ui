import { Component, OnInit } from '@angular/core';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { JWTTokenService } from './../../common/jwt-token.service';
import { GlobalConstants as global } from '../../common/global-constants';
import { User } from '../../entity/user/user';
import { Project } from '../../entity/project/project';
import { Bug } from '../../entity/bug/bug';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  // Icons
  faTasks = faTasks;
  // Default.
  statusDef = "Select bug status";
  assignetToDef = new User (NaN, "Select member to assign to", "");
  // Modal
  modalReference: NgbModalRef;
  closeResult: string;
  updateBug: FormGroup;
  deleteBug: FormGroup;
  createBug: FormGroup;
  statuses = [this.statusDef, "open", "qa", "in progress", "closed"];
  assignetToArray: Array<User>;
  // Data.
  projectId: number;
  project: Project;
  user: User;
  bugs: Array<Bug>;

  constructor(
    public httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService:Title,
    private jwt: JWTTokenService,
    private modalService: NgbModal, 
    private updateBugForm: FormBuilder,
    private deleteBugForm: FormBuilder,
    private createBugForm: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.jwt.getUser();
    //  Get project.
    if (this.isUndefined(this.activatedRoute.snapshot.url[0].path)
    && this.activatedRoute.snapshot.url[0].path !== 'project'
    && this.isUndefined(this.activatedRoute.snapshot.params.id)) {
      return;
    }
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.getProjectRequest();
    this.getBugsRequest();
    // Values for modal selection.
    this.updateBug = this.updateBugForm.group({
      id: null,
      title: "",
      link: "",
      status: this.statusDef,
      assignetTo: this.assignetToDef,
      description: "",
    });
    this.deleteBug= this.deleteBugForm.group({
      id: null,
      title: "",
    });
    this.createBug = this.createBugForm.group({
      id: null,
      title: "",
      link: "",
      status: "",
      assignetTo: "",
      description: "",
    });
    if (this.isUndefined(this.project)) {
      return;
    }
  }

  async getProjectRequest() {
    // Set values to send.
    const url = global.apiURL+'project_get';
    const body = JSON.stringify({
      id: this.projectId,
      jwt: this.jwt.getToken()
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null
        && data['id'] !== null
        && data['title'] !== null
        && data['assignet_to'] !== null
        && data['members'] !== null) {
          // Set projects.
          this.project = new Project(
            data['id'],
            data['title'],
            data['assignet_to'],
            data['members']
          );
          this.titleService.setTitle("BT - project ["+this.project.title+"] bugs list");
          // Value for modal selection.
          this.assignetToArray = [this.assignetToDef, ...this.project.members];
        }
      }
    ).catch(error => console.log(error.message));
  }

  async getBugsRequest() {
    // Set values to send.
    const url = global.apiURL+'task_get_all';
    const body = JSON.stringify({
      id: this.projectId,
      jwt: this.jwt.getToken()
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null) {
          this.bugs = new Array;
          // Get bug.
          for (var key in data) {
            let bug = new Bug(
              data[key]['id'],
              data[key]['title'],
              data[key]['link'],
              data[key]['status'],
              data[key]['assignet_to'],
              data[key]['description']
            );
            this.bugs.push(bug);
          }
        }
      }
    ).catch(error => console.log(error.message));
  }

  async createBugRequest() {
    // Set values to send.
    const assignetToIndex = this.project.members.map(e => e.username).indexOf(this.createBug.value.assignetTo);
    const assignetTo = this.project.members[assignetToIndex];
    const url = global.apiURL+'task_add';
    const body = JSON.stringify({
      id: this.projectId,
      title: this.createBug.value.title,
      link: this.createBug.value.link,
      status: this.createBug.value.status,
      assignet_to: assignetTo.id,
      description: this.createBug.value.description,
      project: this.projectId,
      jwt: this.jwt.getToken()
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null
        && data['id'] !== null
        && data['title'] !== null
        && data['link'] !== null
        && data['status'] !== null
        && data['assignet_to'] !== null
        && data['description'] !== null) {
          if (this.isUndefined(this.bugs)) {
            this.bugs = new Array;
          }
          // Set bug.
          let bug = new Bug(
            data['id'],
            data['title'],
            data['link'],
            data['status'],
            data['assignet_to'],
            data['description']
          );
          this.bugs.push(bug);
          // Back to default.
          this.createBug.patchValue({id: null});
          this.createBug.patchValue({title: ""});
          this.createBug.patchValue({link: ""});
          this.createBug.patchValue({status: "open"});
          this.createBug.patchValue({assignetTo: ""});
          this.createBug.patchValue({description: ""});
        }
      }
    ).catch(error => console.log(error.message));
  }

  createBugF() {
    if (this.createBug.value.title == "") {
      return;
    }
    this.createBugRequest();
    this.modalReference.close('Save Changes');
  }

  openModalCreateBug(content) {
    this.createBug.patchValue({assignetTo: this.user.username});
    this.createBug.patchValue({status: "open"});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  async deleteBugRequest() {
    // Set values to send.
    const url = global.apiURL+'task_delete';
    const body = JSON.stringify({
      id: this.deleteBug.value.id,
      jwt: this.jwt.getToken()
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null && data['status'] == 'Success') {
          // Get index of object with needed id.
          const index = this.bugs.map(e => e.id).indexOf(this.deleteBug.value.id);
          // Delete bug.
          if (index != -1) {
            this.bugs.splice(index, 1);
          }
          // Clean value.
          this.deleteBug.patchValue({id: ""});
          this.deleteBug.patchValue({title: ""});
        }
      }
    ).catch(error => console.log(error.message));
  }

  deleteBugF() {
    this.deleteBugRequest();
    this.modalReference.close('Save Changes');
  }

  openModalDeleteBug(content, id) {
    // Get index of object with needed id.
    const index = this.bugs.map(e => e.id).indexOf(id);
    // Update modal values.
    this.deleteBug.patchValue({id: id});
    this.deleteBug.patchValue({title: this.bugs[index].title});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  async updateBugRequest() {
    // Set values to send.
    const assignetToIndex = this.project.members.map(e => e.username).indexOf(this.updateBug.value.assignetTo);
    if (assignetToIndex == -1) {
      return;
    }
    const assignetTo = this.project.members[assignetToIndex];
    const url = global.apiURL+'task_edit';
    const body = JSON.stringify({
      id : this.updateBug.value.id,
      title : this.updateBug.value.title,
      link : this.updateBug.value.link,
      status : this.updateBug.value.status,
      assignet_to : assignetTo.id,
      description : this.updateBug.value.description,
      project : this.projectId,
      jwt : this.jwt.getToken()
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null
        && data['id'] !== null
        && data['title'] !== null
        && data['link'] !== null
        && data['status'] !== null
        && data['assignet_to'] !== null
        && data['description'] !== null) {
          // Get index of object with needed id.
          const index = this.bugs.map(e => e.id).indexOf(data['id']);
          if (index != -1) {
            this.bugs[index].title = data['title'];
            this.bugs[index].link = data['link'];
            this.bugs[index].status = data['status'];
            if (assignetToIndex != -1) {
              // Assign bug on project member.
              this.bugs[index].assignetTo = assignetTo;
            }
            this.bugs[index].description = data['description'];
          }
          // Back to default.
          this.updateBug.patchValue({id: null});
          this.updateBug.patchValue({title: ""});
          this.updateBug.patchValue({link: ""});
          this.updateBug.patchValue({status: "open"});
          this.updateBug.patchValue({assignetTo: ""});
          this.updateBug.patchValue({description: ""});
        }
      }
    ).catch(error => console.log(error.message));
  }

  updateBugF() {
    this.updateBugRequest();
    this.modalReference.close('Save Changes');
  }

  openModalUpdateBug(content, id) {
    // Get index of object with needed id.
    const index = this.bugs.map(e => e.id).indexOf(id);
    // Update modal values.
    this.updateBug.patchValue({id: id});
    this.updateBug.patchValue({title: this.bugs[index].title});
    this.updateBug.patchValue({link: this.bugs[index].link});
    this.updateBug.patchValue({status: this.bugs[index].status});
    this.updateBug.patchValue({assignetTo: this.bugs[index].assignetTo.username});
    this.updateBug.patchValue({description: this.bugs[index].description});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  isUndefined(val): boolean { return typeof val === 'undefined'; }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
