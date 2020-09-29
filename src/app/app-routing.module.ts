import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { RegistrationComponent } from './registration/registration.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectComponent } from './project/project.component';
import { BugComponent } from './bug/bug.component';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'learn-more', component: LearnMoreComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'project', component: ProjectComponent },
  { path: 'bug/:id', component: BugComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }