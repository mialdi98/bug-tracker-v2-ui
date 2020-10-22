import { Component, OnInit } from '@angular/core';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";

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
  project: Project;
  user: User;
  bugs: Array<Bug>;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));

    const user2 = new User(1, "username2", "Developer");
    this.project = new Project(0, "First one", this.user, [this.user, user2]);
    const bug1 = new Bug(0, "Bug one", "https://git.com/issue/123", this.user, "open", "description of issue1");
    const bug2 = new Bug(1, "Bug two", "https://git.com/issue/321", this.user, "open", "description of issue2");
    this.bugs = new Array;
    this.bugs.push(bug1);
    this.bugs.push(bug2);

    this.titleService.setTitle("BT - project ["+this.project.title+"] bugs list");
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
    this.createBug = this.createBugForm.group({
      id: null,
      title: "",
      link: "",
      status: "",
      assignetTo: "",
      description: "",
    });
  }

  constructor(
    private titleService:Title,
    private modalService: NgbModal, 
    private updateBugForm: FormBuilder,
    private deleteBugForm: FormBuilder,
    private createBugForm: FormBuilder
  ) {}

  createBugF() {
    // @TODO send request to API here.
    // Get index of object with needed id.
    const id = parseInt((Math.random() * 0x10000).toFixed());
    // Create bug.
    if (this.createBug.value.title != "") {
      const newBug = new Bug(
      id,
      this.createBug.value.title,
      this.createBug.value.link,
      this.user,
      this.createBug.value.status,
      this.createBug.value.description);
      this.bugs.push(newBug);
      // Back to default.
      this.createBug.patchValue({title: ""});
      this.createBug.patchValue({link: ""});
      this.createBug.patchValue({status: "open"});
      this.createBug.patchValue({description: ""});
    }
    console.log("CreateBug");
    console.log(this.bugs);
    this.modalReference.close('Save Changes');
  }

  openModalCreateBug(content) {
    this.createBug.patchValue({assignetTo: this.user.username});
    this.createBug.patchValue({status: "open"});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  deleteBugF() {
    // Get index of object with needed id.
    const index = this.bugs.map(e => e.id).indexOf(this.deleteBug.value.id);
    // Delete bug.
    if (index != -1) {
      this.bugs.splice(index, 1);
    }
    console.log("DeletedBug");
    console.log(this.bugs);
    // @TODO send request to API here.
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
    // Get index of object with needed id.
    const index = this.bugs.map(e => e.id).indexOf(this.updateBug.value.id);
    // Update bug values.
    if (this.updateBug.value.title != "") {
      this.bugs[index].title = this.updateBug.value.title;
    }
    if (this.updateBug.value.assignetTo != "") {
      // Get user index by username from members.
      const indexMember = this.project.members.map(e => e.username).indexOf(this.updateBug.value.assignetTo);
      if (indexMember != -1) {
        // Assign bug on another project member.
        this.bugs[index].assignetTo = this.project.members[indexMember];
      }
    }
    if (this.updateBug.value.link != "") {
      this.bugs[index].link = this.updateBug.value.link;
    }
    if (this.updateBug.value.status != "") {
      this.bugs[index].status = this.updateBug.value.status;
    }
    if (this.updateBug.value.description != "") {
      this.bugs[index].description = this.updateBug.value.description;
    }
    console.log("UpdatedBug");
    console.log(this.bugs[index]);
    // @TODO send request to API here.
    this.modalReference.close('Save Changes');
  }

  openModalUpdateBug(content, id) {
    // Get index of object with needed id.
    const index = this.bugs.map(e => e.id).indexOf(id);
    // Update modal values.
    this.updateBug.patchValue({id: id});
    this.updateBug.patchValue({title: this.bugs[index].title});
    this.updateBug.patchValue({assignetTo: this.bugs[index].assignetTo.username});
    this.updateBug.patchValue({link: this.bugs[index].link});
    this.updateBug.patchValue({status: this.bugs[index].status});
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
