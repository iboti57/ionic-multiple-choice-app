import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditCollectionPage } from './edit-collection.page';

const routes: Routes = [
  {
    path: '',
    component: EditCollectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditCollectionPageRoutingModule {}
