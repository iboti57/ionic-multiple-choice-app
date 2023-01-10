import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateQPage } from './create-q.page';

const routes: Routes = [
  {
    path: '',
    component: CreateQPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQPageRoutingModule {}
