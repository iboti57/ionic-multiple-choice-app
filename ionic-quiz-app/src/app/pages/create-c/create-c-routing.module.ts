import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCPage } from './create-c.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCPageRoutingModule {}
