import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './controller/index/index.component';
import { LearnMoreComponent } from './controller/learn-more/learn-more.component';
import { RegistrationComponent } from './controller/registration/registration.component';
import { ProjectsComponent } from './controller/projects/projects.component';
import { ProjectComponent } from './controller/project/project.component';
import { BugComponent } from './controller/bug/bug.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
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
