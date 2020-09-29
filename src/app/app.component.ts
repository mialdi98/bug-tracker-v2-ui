import { Component } from '@angular/core';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  faSignInAlt = faSignInAlt;
  faSignOutAlt = faSignOutAlt;
}
