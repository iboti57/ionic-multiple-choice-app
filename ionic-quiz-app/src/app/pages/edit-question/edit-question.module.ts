import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditQuestionPageRoutingModule } from './edit-question-routing.module';

import { EditQuestionPage } from './edit-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditQuestionPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditQuestionPage]
})
export class EditQuestionPageModule {}
