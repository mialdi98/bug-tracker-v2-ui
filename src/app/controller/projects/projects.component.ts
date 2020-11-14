import { Component, OnInit } from '@angular/core';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';

import { GlobalConstants } from '../../common/global-constants';
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

  async getProjectsRequest() {
    // Set values to send.
    const url = GlobalConstants.apiURL+'project_get_all';
    const body = JSON.stringify({
      uid: this.user.id
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null) {
          this.projects = new Array;
          // Set projects.
          for (var key in data) {
            let project = new Project(
              data[key]['id'],
              data[key]['title'],
              data[key]['assignet_to'],
              data[key]['members']
            );
            this.projects.push(project);
          }
        }
      }
    ).catch(error => console.log(error.message));
  }

  async createProjectRequest() {
    // Set values to send.
    const url = GlobalConstants.apiURL+'project_add';
    const body = JSON.stringify({
      title: this.CreateProject.value.projectTitle,
      assignet_to: this.user.id,
      members: [this.user.id],
      uid: this.user.id
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null) {
          if (this.isUndefined(this.projects)) {
            this.projects = new Array;
          }
          // Set project.
          let project = new Project(
            data['id'],
            data['title'],
            data['assignet_to'],
            data['members']
          );
          this.projects.push(project);
          // Clear value.
          this.CreateProject.patchValue({projectTitle: ""});
        }
      }
    ).catch(error => console.log(error.message));
  }

  createProject() {
    if (this.CreateProject.value.projectTitle != "") {
      this.createProjectRequest();
    }
    this.modalReference.close('Save Changes');
  }

  openModalCreateeProject(content) {
    // Open modal.
    this.modalReference = this.modalService.open(content);
  }

  async deleteProjectRequest() {
    // Set values to send.
    const projectId = this.DeleteProject.value.id;
    const url = GlobalConstants.apiURL+'project_delete';
    const body = JSON.stringify({
      id: projectId,
      uid: this.user.id
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null && data['status'] == 'Success') {
          // Delete project.
          const index = this.projects.map(e => e.id).indexOf(projectId);
          if (index != -1) {
            this.projects.splice(index, 1);
          }
          // Clean value.
          this.DeleteProject.patchValue({id: ""});
          this.DeleteProject.patchValue({projectTitle: ""});
        }
      }
    ).catch(error => console.log(error.message));
  }

  deleteProject() {
    this.deleteProjectRequest();
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

  async updateProjectRequest(index, members) {
    // Set values to send.
    const url = GlobalConstants.apiURL+'project_edit';
    const body = JSON.stringify({
      id: this.UpdateProject.value.id,
      title: this.UpdateProject.value.projectTitle,
      assignet_to:  this.UpdateProject.value.assignetTo,
      members: members,
      uid: this.user.id
    });
    // Request.
    await this.httpClient.post(url,body).toPromise().then(
      data => {
        if (data !== null && data['status'] == 'Success') {
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
      }
    ).catch(error => console.log(error.message));
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
    this.updateProjectRequest(index, members);

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
