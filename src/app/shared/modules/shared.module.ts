import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { InvoiceFormComponent } from '../components/invoice-form/invoice-form.component';
import { SignaturePadComponent } from '../components/signature-pad/signature-pad.component';
import {CommonComponentsModule} from "../../common/components/common-components.module";
import {FlexLayoutModule} from "ngx-flexible-layout";

@NgModule({
  declarations: [
    SignaturePadComponent ,
    InvoiceFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    CommonComponentsModule,
    FlexLayoutModule,
   // SignaturePadModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    CommonComponentsModule,
    SignaturePadComponent,
    InvoiceFormComponent
  ]
})
export class SharedModule { }
