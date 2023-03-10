import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModePageRoutingModule } from './mode-routing.module';

import { ModePage } from './mode.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ModePageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [ModePage]
})
export class ModePageModule {}
