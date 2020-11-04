import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './controller/index/index.component';
import { LearnMoreComponent } from './controller/learn-more/learn-more.component';
import { RegistrationComponent } from './controller/registration/registration.component';
import { ProjectsComponent } from './controller/projects/projects.component';
import { ProjectComponent } from './controller/project/project.component';
import { BugComponent } from './controller/bug/bug.component';

import { AuthGuard } from './common/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'learn-more', component: LearnMoreComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'project/:id', component: ProjectComponent, canActivate: [AuthGuard] },
  { path: 'bug/:id', component: BugComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/index' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }