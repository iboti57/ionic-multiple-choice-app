import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewQuestionsPageRoutingModule } from './view-questions-routing.module';

import { ViewQuestionsPage } from './view-questions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewQuestionsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ViewQuestionsPage]
})
export class ViewQuestionsPageModule { }
