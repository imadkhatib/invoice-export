import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {CreateInvoiceComponent} from "./create-invoice/create-invoice.component";
import {SharedModule} from "../../shared/modules/shared.module";
import {InvoicesService} from "../../services/invoices.service";
import {FlexModule} from "ngx-flexible-layout";

const routes: Routes = [
  {
    path: '',
    component: CreateInvoiceComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    CreateInvoiceComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    FlexModule
  ],
  providers: [
    InvoicesService
  ]
})
export class InvoicesModule { }
