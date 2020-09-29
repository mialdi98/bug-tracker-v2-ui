import { Component, OnInit } from '@angular/core';
import { faTasks } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  faTasks = faTasks;
}
