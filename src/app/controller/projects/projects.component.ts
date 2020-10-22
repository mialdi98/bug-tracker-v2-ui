import { Component, OnInit } from '@angular/core';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';

import { User } from '../../entity/user/user';
import { Project } from '../../entity/project/project';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})

export class ProjectsComponent implements OnInit {
  // Icons
  faProjectDiagram = faProjectDiagram;
  // Modal
  modalReference: NgbModalRef;
  closeResult: string;
  UpdateProject: FormGroup;
  DeleteProject: FormGroup;
  CreateProject: FormGroup;
  // Data.
  projects: Array<Project>;
  user: User;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));

    const project1 = new Project(0, "First one", this.user, [this.user]);
    const project2 = new Project(1, "First two", this.user, [this.user]);
    this.projects = new Array;
    this.projects.push(project1);
    this.projects.push(project2);

    this.titleService.setTitle("BT - projects list");
    this.UpdateProject = this.UpdateProjectForm.group({
      id: null,
      projectTitle: "",
      assignetTo: "",
      newMember: "",
    });
    this.DeleteProject = this.DeleteProjectForm.group({
      id: null,
      projectTitle: "",
    });
    this.CreateProject = this.CreateProjectForm.group({
      id: null,
      projectTitle: "",
    });
  }

  constructor(
    public httpClient: HttpClient,
    private titleService:Title,
    private modalService: NgbModal, 
    private UpdateProjectForm: FormBuilder,
    private DeleteProjectForm: FormBuilder,
    private CreateProjectForm: FormBuilder
) {}

  createProject() {
    // @TODO send request to API here.
    // Get index of object with needed id.
    const id = parseInt((Math.random() * 0x10000).toFixed());
    // create project.
    if (this.CreateProject.value.projectTitle != "") {
      const newProject = new Project(id,this.CreateProject.value.projectTitle, this.user);
      this.projects.push(newProject);
      this.CreateProject.value.projectTitle = "";
    }
    console.log("CreateProject");
    console.log(this.projects);
    this.modalReference.close('Save Changes');
  }

  openModalCreateeProject(content) {
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  deleteProject() {
    // Get index of object with needed id.
    const index = this.projects.map(e => e.id).indexOf(this.DeleteProject.value.id);
    // Delete project.
    if (!this.isUndefined(index)) {
      this.projects.splice(index, 1);
    }
    console.log("DeletedProject");
    console.log(this.projects);
    // @TODO send request to API here.
    this.modalReference.close('Save Changes');
  }

  openModalDeleteProject(content, id) {
    // Get index of object with needed id.
    const index = this.projects.map(e => e.id).indexOf(id);
    // Update modal values.
    this.DeleteProject.patchValue({id: id});
    this.DeleteProject.patchValue({projectTitle: this.projects[index].title});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  updateProject() {
    // Get index of object with needed id.
    const index = this.projects.map(e => e.id).indexOf(this.UpdateProject.value.id);
    // Update project values.
    if (this.UpdateProject.value.projectTitle != "") {
      this.projects[index].title = this.UpdateProject.value.projectTitle;
    }
    if (this.UpdateProject.value.newMember != "") {
      this.projects[index].members.push(this.UpdateProject.value.newMember);
      this.UpdateProject.patchValue({newMember: ""});
    }
    console.log("UpdatedProject");
    console.log(this.projects[index].title);
    console.log(this.projects[index].assignetTo);
    console.log(this.projects[index].members);
    // @TODO send request to API here.
    this.modalReference.close('Save Changes');
  }

  openModalUpdateProject(content, id) {
    // Get index of object with needed id.
    const index = this.projects.map(e => e.id).indexOf(id);
    // Update modal values.
    this.UpdateProject.patchValue({id: id});
    this.UpdateProject.patchValue({projectTitle: this.projects[index].title});
    this.UpdateProject.patchValue({assignetTo: this.projects[index].assignetTo.username});
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  isUndefined(val): boolean { return typeof val === 'undefined'; }

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
