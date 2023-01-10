import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCPageRoutingModule } from './create-c-routing.module';

import { CreateCPage } from './create-c.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateCPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CreateCPage]
})
export class CreateCPageModule { }
