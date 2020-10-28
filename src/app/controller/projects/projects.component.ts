import { Component, OnInit } from '@angular/core';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient, HttpParams } from '@angular/common/http';

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

  constructor(
    public httpClient: HttpClient,
    private titleService:Title,
    private modalService: NgbModal, 
    private UpdateProjectForm: FormBuilder,
    private DeleteProjectForm: FormBuilder,
    private CreateProjectForm: FormBuilder
) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getProjectsRequest();
    this.titleService.setTitle("BT - projects list");
    this.UpdateProject = this.UpdateProjectForm.group({
      id: null,
      projectTitle: "",
      assignetTo: "",
      members: [],
      newMember: "",
    });
    this.DeleteProject = this.DeleteProjectForm.group({
      id: null,
      projectTitle: "",
    });
    this.CreateProject = this.CreateProjectForm.group({
      projectTitle: "",
    });
  }

  getProjectsRequest() {
    //  Get projects.
    const url = 'http://bug-tracker.local/project_get_all';
    const params = new HttpParams().set('uid', this.user.id.toString());
    const options = {params: params};
    this.httpClient.get(url,options)
    .subscribe((response)=>{
      if (response !== null) {
        this.projects = new Array;
        // Set projects.
        for (var key in response) {
          let project = new Project(
            response[key]['id'],
            response[key]['title'],
            response[key]['assignet_to'],
            response[key]['members']
          );
          this.projects.push(project);
        }
      }
    });
  }

  createProject() {
    if (this.CreateProject.value.projectTitle != "") {
      // Set values to send.
      const url = 'http://bug-tracker.local/project_add';
      const params = new HttpParams()
      .set('title', this.CreateProject.value.projectTitle.toString())
      .set('assignet_to', this.user.id.toString())
      .set('members[]', this.user.id.toString())
      .set('uid', this.user.id.toString());
      const options = {params: params};
      // Clear value.
      this.CreateProject.patchValue({projectTitle: ""});
      // Request.
      this.httpClient.get(url,options).subscribe((response)=>{
        if (response !== null) {
          if (this.isUndefined(this.projects)) {
            this.projects = new Array;
          }
          // Set project.
          let project = new Project(
            response['id'],
            response['title'],
            response['assignet_to'],
            response['members']
          );
          this.projects.push(project);
        }
      });
      console.log("CreateProject");
      console.log(this.projects);
    }
    this.modalReference.close('Save Changes');
  }

  openModalCreateeProject(content) {
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  deleteProject() {
    // Set values to send.
    const projectId = this.DeleteProject.value.id;
    const url = 'http://bug-tracker.local/project_delete';
    const params = new HttpParams()
    .set('id', projectId.toString())
    .set('uid', this.user.id.toString());
    const options = {params: params};
    // Request.
    this.httpClient.get(url,options).subscribe((response)=>{
      if (response !== null && response['status'] == 'Success') {
        // Delete project.
        const index = this.projects.map(e => e.id).indexOf(projectId);
        if (index != -1) {
          this.projects.splice(index, 1);
        }
      }
    });
    // Clean value.
    this.DeleteProject.patchValue({id: ""});
    this.DeleteProject.patchValue({projectTitle: ""});
    console.log("DeletedProject");
    console.log(this.projects);
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
    // Add new member to members.
    if (this.UpdateProject.value.newMember != "") {
      this.UpdateProject.value.members.push({username: this.UpdateProject.value.newMember});
    }
    // Members array shaping.
    const members = [];
    for (const member of this.UpdateProject.value.members) {
      members.push(member.username);
    }
    // Set values to send.
    const url = 'http://bug-tracker.local/project_edit';
    const params = new HttpParams()
    .set('id', this.UpdateProject.value.id.toString())
    .set('title', this.UpdateProject.value.projectTitle.toString())
    .set('assignet_to', this.UpdateProject.value.assignetTo.toString())
    .set('members', JSON.stringify(members))
    .set('uid', this.user.id.toString());
    const options = {params: params};
    // Request.
    this.httpClient.get(url,options).subscribe((response)=>{
      if (response !== null && response['status'] == 'Success') {
        // Update project.
        this.projects[index].id = this.UpdateProject.value.id;
        this.projects[index].title = this.UpdateProject.value.projectTitle;
        // Get index of object with needed id.
        const indexMember = this.projects[index].members.map(e => e.username).indexOf(this.UpdateProject.value.assignetTo);
        this.projects[index].assignetTo = this.UpdateProject.value.members[indexMember];
        this.projects[index].members = this.UpdateProject.value.members;
        // Clear values.
        this.UpdateProject.patchValue({id: ""});
        this.UpdateProject.patchValue({projectTitle: ""});
        this.UpdateProject.patchValue({assignetTo: ""});
        this.UpdateProject.patchValue({members: []});
        this.UpdateProject.patchValue({newMember: ""});
      }
    });
    console.log("UpdatedProject");
    console.log(this.projects[index]);
    this.modalReference.close('Save Changes');
  }

  openModalUpdateProject(content, id) {
    // Get index of object with needed id.
    const index = this.projects.map(e => e.id).indexOf(id);
    // Update modal values.
    this.UpdateProject.patchValue({id: this.projects[index].id});
    this.UpdateProject.patchValue({projectTitle: this.projects[index].title});
    this.UpdateProject.patchValue({assignetTo: this.projects[index].assignetTo.username});
    this.UpdateProject.patchValue({members: this.projects[index].members});
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
