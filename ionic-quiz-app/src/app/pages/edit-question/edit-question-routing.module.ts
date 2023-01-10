import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditQuestionPage } from './edit-question.page';

const routes: Routes = [
  {
    path: '',
    component: EditQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditQuestionPageRoutingModule {}
