import { Component, OnInit } from '@angular/core';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { Router } from '@angular/router';

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
  project: Project;
  user: User;
  bug: Bug;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));
    const user2 = new User(1, "username2", "Developer");
    this.project = new Project(0, "First one", this.user, [this.user, user2]);
    this.bug = new Bug(0, "Bug one", "https://git.com/issue/123", this.user, "open", "description of issue1");

    this.titleService.setTitle("BT - project ["+this.project.title+"] bug ["+this.bug.title+"]");
    // Value for modal selection.
    this.assignetToArray = [this.assignetToDef, ...this.project.members];
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

  constructor(
    private titleService:Title,
    private router: Router,
    private modalService: NgbModal, 
    private updateBugForm: FormBuilder,
    private deleteBugForm: FormBuilder,
  ) {}

  deleteBugF() {
    // Delete bug.
    console.log("DeletedBug");
    console.log(this.bug);
    // @TODO send request to API here.
    this.modalReference.close('Save Changes');
    this.router.navigate(['/project'+this.project.id]);
  }

  openModalDeleteBug(content) {
    // Update modal values.
    this.deleteBug.patchValue({id: this.bug.id});
    this.deleteBug.patchValue({title: this.bug.title});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  updateBugF() {
    // Update bug values.
    if (this.updateBug.value.title != "") {
      this.bug.title = this.updateBug.value.title;
    }
    if (this.updateBug.value.assignetTo != "") {
      // Get user index by username from members.
      const indexMember = this.project.members.map(e => e.username).indexOf(this.updateBug.value.assignetTo);
      if (indexMember != -1) {
        // Assign bug on another project member.
        this.bug.assignetTo = this.project.members[indexMember];
      }
    }
    if (this.updateBug.value.link != "") {
      this.bug.link = this.updateBug.value.link;
    }
    if (this.updateBug.value.status != "") {
      this.bug.status = this.updateBug.value.status;
    }
    if (this.updateBug.value.description != "") {
      this.bug.description = this.updateBug.value.description;
    }
    console.log("UpdatedBug");
    console.log(this.bug);
    // @TODO send request to API here.
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
