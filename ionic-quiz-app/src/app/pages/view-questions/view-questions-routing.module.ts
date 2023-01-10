import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewQuestionsPage } from './view-questions.page';

const routes: Routes = [
  {
    path: '',
    component: ViewQuestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewQuestionsPageRoutingModule {}
