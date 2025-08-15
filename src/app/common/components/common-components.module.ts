import {NgModule} from '@angular/core';
import {InputComponent} from "./input/input.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../shared/modules/material.module";
import { DatePickerComponent } from './date-picker/date-picker.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import {ConfirmDialogService} from "../services/confirm-dialog.service";

@NgModule({
  declarations: [
    InputComponent,
    DatePickerComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    InputComponent,
    DatePickerComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmDialogService],
})
export class CommonComponentsModule {
}
