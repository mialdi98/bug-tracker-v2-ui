import { Component, OnInit } from '@angular/core';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalConstants } from '../../common/global-constants';
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

  async getBugRequest() {
    if (this.isUndefined(this.activatedRoute.snapshot.url[0].path)
    && this.activatedRoute.snapshot.url[0].path !== 'bug'
    && this.isUndefined(this.activatedRoute.snapshot.params.id)) {
      return;
    }
    // Set values to send.
    this.bugId = this.activatedRoute.snapshot.params.id;
    const url = GlobalConstants.apiURL+'task_get';
    const body = JSON.stringify({
      id: this.bugId,
      uid: this.user.id
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
        && data['description'] !== null
        && data['project'] !== null) {
          this.bug = new Bug(
            data['id'],
            data['title'],
            data['link'],
            data['status'],
            data['assignet_to'],
            data['description']
          );
          this.project = data['project'];
          // Value for modal selection.
          this.assignetToArray = [this.assignetToDef, ...this.project.members];
        }
      }
    ).catch(error => console.log(error.message));
  }

  async deleteBugRequest() {
    // Set values to send.
    const url = GlobalConstants.apiURL+'task_delete';
    const body = JSON.stringify({
      id: this.deleteBug.value.id,
      uid: this.user.id
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null && data['status'] == 'Success') {
          this.router.navigate(['/project'+this.project.id]);
        }
      }
    ).catch(error => console.log(error.message));
  }

  deleteBugF() {
    this.deleteBugRequest();
    this.modalReference.close('Save Changes');
  }

  openModalDeleteBug(content) {
    // Update modal values.
    this.deleteBug.patchValue({id: this.bug.id});
    this.deleteBug.patchValue({title: this.bug.title});
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
    const url = GlobalConstants.apiURL+'task_edit';
    const body = JSON.stringify({
      id: this.updateBug.value.id,
      title: this.updateBug.value.title,
      link: this.updateBug.value.link,
      status: this.updateBug.value.status,
      assignet_to: assignetTo.id,
      description: this.updateBug.value.description,
      project: this.project.id,
      uid: this.user.id
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
        && data['description']) {
          this.bug.title = data['title'];
          this.bug.link = data['link'];
          this.bug.status = data['status'];
            // Assign bug on project member.
          this.bug.assignetTo = assignetTo;
          this.bug.description = data['description'];
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
