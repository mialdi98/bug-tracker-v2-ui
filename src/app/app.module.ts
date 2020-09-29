import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { RegistrationComponent } from './registration/registration.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectComponent } from './project/project.component';
import { BugComponent } from './bug/bug.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  declarations: [
    AppComponent,
    ProjectComponent,
    BugComponent,
    ProjectsComponent,
    LearnMoreComponent,
    IndexComponent,
    RegistrationComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
