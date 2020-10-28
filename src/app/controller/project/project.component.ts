import { Component, OnInit } from '@angular/core';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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
    private modalService: NgbModal, 
    private updateBugForm: FormBuilder,
    private deleteBugForm: FormBuilder,
    private createBugForm: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));
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


  getProjectRequest() {
    //  Get project.
    if (this.isUndefined(this.activatedRoute.snapshot.url[0].path)
    && this.activatedRoute.snapshot.url[0].path !== 'project'
    && this.isUndefined(this.activatedRoute.snapshot.params.id)) {
      return;
    }
    this.projectId = this.activatedRoute.snapshot.params.id;
    const url = 'http://bug-tracker.local/project_get';
    const params = new HttpParams()
    .set('id', this.projectId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null
      && response['id'] !== null
      && response['title'] !== null
      && response['assignet_to'] !== null
      && response['members'] !== null) {
        // Set projects.
        this.project = new Project(
          response['id'],
          response['title'],
          response['assignet_to'],
          response['members']
        );
        this.titleService.setTitle("BT - project ["+this.project.title+"] bugs list");
        // Value for modal selection.
        this.assignetToArray = [this.assignetToDef, ...this.project.members];
      }
    });
  }

  getBugsRequest() {
    //  Get bugs.
    const url = 'http://bug-tracker.local/task_get_all';
    const params = new HttpParams()
    .set('id', this.projectId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null) {
        this.bugs = new Array;
        // Get bug.
        for (var key in response) {
          let bug = new Bug(
            response[key]['id'],
            response[key]['title'],
            response[key]['link'],
            response[key]['status'],
            response[key]['assignet_to'],
            response[key]['description']
          );
          this.bugs.push(bug);
        }
      }
    });
  }

  createBugF() {
    if (this.createBug.value.title == "") {
      return;
    }
    // Set values to send.
    const assignetToIndex = this.project.members.map(e => e.username).indexOf(this.createBug.value.assignetTo);
    const assignetTo = this.project.members[assignetToIndex];
    
    const url = 'http://bug-tracker.local/task_add';
    const params = new HttpParams()
    .set('title', this.createBug.value.title.toString())
    .set('link', this.createBug.value.link.toString())
    .set('status', this.createBug.value.status.toString())
    .set('assignet_to', assignetTo.id.toString())
    .set('description', this.createBug.value.description.toString())
    .set('project', this.projectId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    // Request.
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null
      && response['id'] !== null
      && response['title'] !== null
      && response['link'] !== null
      && response['status'] !== null
      && response['assignet_to'] !== null
      && response['description']) {
        if (this.isUndefined(this.bugs)) {
          this.bugs = new Array;
        }
        // Set bug.
        let bug = new Bug(
          response['id'],
          response['title'],
          response['link'],
          response['status'],
          response['assignet_to'],
          response['description']
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
    });
    this.modalReference.close('Save Changes');
  }

  openModalCreateBug(content) {
    this.createBug.patchValue({assignetTo: this.user.username});
    this.createBug.patchValue({status: "open"});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  deleteBugF() {
    // Set values to send.
    const url = 'http://bug-tracker.local/task_delete';
    const params = new HttpParams()
    .set('id', this.deleteBug.value.id.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    // Request.
    this.httpClient.get(url,options).subscribe((response)=>{
      if (response !== null && response['status'] == 'Success') {
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
    });
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

  updateBugF() {
    // Set values to send.
    const assignetToIndex = this.project.members.map(e => e.username).indexOf(this.updateBug.value.assignetTo);
    if (assignetToIndex == -1) {
      return;
    }
    const assignetTo = this.project.members[assignetToIndex];

    const url = 'http://bug-tracker.local/task_edit';
    const params = new HttpParams()
    .set('id', this.updateBug.value.id.toString())
    .set('title', this.updateBug.value.title.toString())
    .set('link', this.updateBug.value.link.toString())
    .set('status', this.updateBug.value.status.toString())
    .set('assignet_to', assignetTo.id.toString())
    .set('description', this.updateBug.value.description.toString())
    .set('project', this.projectId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    // Request.
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null
      && response['id'] !== null
      && response['title'] !== null
      && response['link'] !== null
      && response['status'] !== null
      && response['assignet_to'] !== null
      && response['description']) {
        // Get index of object with needed id.
        const index = this.bugs.map(e => e.id).indexOf(response['id']);
        if (index != -1) {
          this.bugs[index].title = response['title'];
          this.bugs[index].link = response['link'];
          this.bugs[index].status = response['status'];
          if (assignetToIndex != -1) {
            // Assign bug on project member.
            this.bugs[index].assignetTo = assignetTo;
          }
          this.bugs[index].description = response['description'];
        }
        // Back to default.
        this.updateBug.patchValue({id: null});
        this.updateBug.patchValue({title: ""});
        this.updateBug.patchValue({link: ""});
        this.updateBug.patchValue({status: "open"});
        this.updateBug.patchValue({assignetTo: ""});
        this.updateBug.patchValue({description: ""});
      }
    });
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
