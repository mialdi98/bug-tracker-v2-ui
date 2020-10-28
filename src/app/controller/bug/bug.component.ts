import { Component, OnInit } from '@angular/core';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { User } from '../../entity/user/user';
import { Project } from '../../entity/project/project';
import { Bug } from '../../entity/bug/bug';

@Component({
  selector: 'app-bug',
  templateUrl: './bug.component.html',
  styleUrls: ['./bug.component.scss']
})
export class BugComponent implements OnInit {
  // Icons.
  faThumbtack = faThumbtack;
  // Default.
  statusDef = "Select bug status";
  assignetToDef = new User (NaN, "Select member to assign to", "");
  // Modal
  modalReference: NgbModalRef;
  closeResult: string;
  updateBug: FormGroup;
  deleteBug: FormGroup;
  statuses = [this.statusDef, "open", "qa", "in progress", "closed"];
  assignetToArray: Array<User>;
  // Data.
  bugId: number;
  project: Project;
  user: User;
  bug: Bug;

  constructor(
    public httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService:Title,
    private router: Router,
    private modalService: NgbModal, 
    private updateBugForm: FormBuilder,
    private deleteBugForm: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getBugRequest();

    // Value for modal selection.
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
  }

  getBugRequest() {
    if (this.isUndefined(this.activatedRoute.snapshot.url[0].path)
    && this.activatedRoute.snapshot.url[0].path !== 'bug'
    && this.isUndefined(this.activatedRoute.snapshot.params.id)) {
      return;
    }
    this.bugId = this.activatedRoute.snapshot.params.id;
    //  Get bug.
    const url = 'http://bug-tracker.local/task_get';
    const params = new HttpParams()
    .set('id', this.bugId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null
      && response['id'] !== null
      && response['title'] !== null
      && response['link'] !== null
      && response['status'] !== null
      && response['assignet_to'] !== null
      && response['description'] !== null
      && response['project'] !== null) {
        this.bug = new Bug(
          response['id'],
          response['title'],
          response['link'],
          response['status'],
          response['assignet_to'],
          response['description']
        );
        this.project = response['project'];
        // Value for modal selection.
        this.assignetToArray = [this.assignetToDef, ...this.project.members];
      }
    });
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
        this.router.navigate(['/project'+this.project.id]);
      }
    });
    this.modalReference.close('Save Changes');
  }

  openModalDeleteBug(content) {
    // Update modal values.
    this.deleteBug.patchValue({id: this.bug.id});
    this.deleteBug.patchValue({title: this.bug.title});
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
    .set('project', this.project.id.toString())
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
        this.bug.title = response['title'];
        this.bug.link = response['link'];
        this.bug.status = response['status'];
          // Assign bug on project member.
        this.bug.assignetTo = assignetTo;
        this.bug.description = response['description'];
      }
      // Back to default.
      this.updateBug.patchValue({id: null});
      this.updateBug.patchValue({title: ""});
      this.updateBug.patchValue({link: ""});
      this.updateBug.patchValue({status: "open"});
      this.updateBug.patchValue({assignetTo: ""});
      this.updateBug.patchValue({description: ""});
    });
    this.modalReference.close('Save Changes');
  }

  openModalUpdateBug(content) {
    // Update modal values.
    this.updateBug.patchValue({id: this.bug.id});
    this.updateBug.patchValue({title: this.bug.title});
    this.updateBug.patchValue({assignetTo: this.bug.assignetTo.username});
    this.updateBug.patchValue({link: this.bug.link});
    this.updateBug.patchValue({status: this.bug.status});
    this.updateBug.patchValue({description: this.bug.description});
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
