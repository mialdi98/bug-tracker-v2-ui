import { Component, OnInit } from '@angular/core';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bug',
  templateUrl: './bug.component.html',
  styleUrls: ['./bug.component.scss']
})
export class BugComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  faThumbtack = faThumbtack;
}
