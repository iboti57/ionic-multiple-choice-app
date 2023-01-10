import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/create-c/create-c.module').then( m => m.CreateCPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/create-q/create-q.module').then( m => m.CreateQPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/edit-collection/edit-collection.module').then( m => m.EditCollectionPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-question',
    loadChildren: () => import('./pages/edit-question/edit-question.module').then( m => m.EditQuestionPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'mode/:command/:id',
    loadChildren: () => import('./pages/mode/mode.module').then( m => m.ModePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mode/:command/:id',
    loadChildren: () => import('./pages/result/result.module').then( m => m.ResultPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'view-questions/:id',
    loadChildren: () => import('./pages/view-questions/view-questions.module').then( m => m.ViewQuestionsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
