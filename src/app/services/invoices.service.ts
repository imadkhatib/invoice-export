import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import {InvoiceApiRequest, InvoiceFormData, InvoiceSubmissionResult} from "../interfaces/invoice.interface";
import {PdfGeneratorService} from "./pdf-generator.service";
import {InvoicesMockService} from "./invoices-mock.services";


@Injectable()
export class InvoicesService {

  private _formData = new BehaviorSubject<Partial<InvoiceFormData>>({});

  private _isSubmittingInvoice = new BehaviorSubject<boolean>(false);
  public isSubmittingInvoice$ = this._isSubmittingInvoice.asObservable();

  private _isValidInvoice = new BehaviorSubject<boolean>(false);
  public isValidInvoice$ = this._isValidInvoice.asObservable();

  private _invoiceSubmissionResult = new BehaviorSubject<InvoiceSubmissionResult | null>(null);
  public invoiceSubmissionResult$ = this._invoiceSubmissionResult.asObservable();

  private _generatedInvoicePdf = new BehaviorSubject<File | null>(null);

  public canSubmit$ = combineLatest([
    this.isValidInvoice$,
    this.isSubmittingInvoice$
  ]).pipe(
    map(([isValid, isSubmitting]) =>
      isValid && !isSubmitting
    )
  );

  constructor(
    private invoicesMockService: InvoicesMockService,
    private pdfGeneratorService: PdfGeneratorService
  ) { }

  updateFormData(data: Partial<InvoiceFormData>): void {
    const currentData = this._formData.value;
    const updatedData = { ...currentData, ...data };
    this._formData.next(updatedData);
  }

  updateFormValidation(isValid: boolean): void {
    this._isValidInvoice.next(isValid);
  }

  submitInvoice(): Observable<InvoiceSubmissionResult> {
    this._isSubmittingInvoice.next(true);
    this._invoiceSubmissionResult.next(null);

    try {
      const formData = this._formData.value as InvoiceFormData;

      const invoicePdfFile = this.pdfGeneratorService.generateInvoicePdf(formData);

      const apiRequest: InvoiceApiRequest = {
        invoiceDetails: formData.invoiceDetails,
        personalDetails: formData.personalDetails,
        invoicePdfFile: invoicePdfFile
      }

      return this.invoicesMockService.submitInvoice(apiRequest).pipe(
        map((apiResponse) => {
          const result: InvoiceSubmissionResult = {
            success: apiResponse.success,
            message: apiResponse.message,
            invoiceId: apiResponse.invoiceId
          };

          this._invoiceSubmissionResult.next(result);
          this._generatedInvoicePdf.next(invoicePdfFile);

          return result;
        }),
        catchError((error) => {
          const errorResult: InvoiceSubmissionResult = {
            success: false,
            message: error.message || 'An error occurred while submitting invoice. Please retry or contact support.'
          };

          this._invoiceSubmissionResult.next(errorResult);
          return of(errorResult);
        }),
        finalize(() => {
          this._isSubmittingInvoice.next(false);
        })
      );
    }
    catch (error: any) {
      this._isSubmittingInvoice.next(false);
      const errorResult: InvoiceSubmissionResult = {
        success: false,
        message: error.message || 'Failed to generate invoice'
      };

      this._invoiceSubmissionResult.next(errorResult);
      return of(errorResult);
    }
  }

  resetWithPdf(): void {
    this._formData.next({});
    this._isValidInvoice.next(false);
    this._invoiceSubmissionResult.next(null);
    this._isSubmittingInvoice.next(false);
  }

  resetForm(): void {
    this._formData.next({});
    this._isValidInvoice.next(false);
    this._invoiceSubmissionResult.next(null);
    this._generatedInvoicePdf.next(null);
    this._isSubmittingInvoice.next(false);
  }

  getCurrentPdf(): File | null {
    return this._generatedInvoicePdf.value;
  }

  clearSubmissionResult(): void {
    this._invoiceSubmissionResult.next(null);
    this._generatedInvoicePdf.next(null);
  }

  downloadPdf(): void {
    const invoicePdfFile = this._generatedInvoicePdf.value;
    if (invoicePdfFile) {
      const url = URL.createObjectURL(invoicePdfFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoicePdfFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  previewPdf(): void {
    const invoicePdfFile = this._generatedInvoicePdf.value;
    if (invoicePdfFile) {
      const url = URL.createObjectURL(invoicePdfFile);
      window.open(url, '_blank');
    }
  }
}
