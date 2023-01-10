import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCollectionPageRoutingModule } from './edit-collection-routing.module';

import { EditCollectionPage } from './edit-collection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditCollectionPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditCollectionPage]
})
export class EditCollectionPageModule { }
