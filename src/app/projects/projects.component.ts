import { Component, OnInit } from '@angular/core';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  faProjectDiagram = faProjectDiagram;
}
