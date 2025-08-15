import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject, takeUntil} from 'rxjs';
import {InvoiceFormComponent} from 'src/app/shared/components/invoice-form/invoice-form.component';
import {InvoicesService} from "../../../services/invoices.service";
import {InvoiceFormData, InvoiceSubmissionResult} from "../../../interfaces/invoice.interface";
import {ConfirmDialogService} from "../../../common/services/confirm-dialog.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {
  @ViewChild(InvoiceFormComponent) invoiceFormComponent!: InvoiceFormComponent;
  private destroy$ = new Subject<void>();
  isSubmitting$ = this.invoicesService.isSubmittingInvoice$;
  submissionResult$ = this.invoicesService.invoiceSubmissionResult$;
  canSubmit$ = this.invoicesService.canSubmit$;

  constructor(
    private invoicesService: InvoicesService,
    private snackBar: MatSnackBar,
    private confirmDialogService: ConfirmDialogService
  ) {
  }

  ngOnInit() {
    this.submissionResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.handleSubmissionResult(result);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleSubmissionResult(result: InvoiceSubmissionResult) {
    if (result.success) {
      this.showSuccessMessage(result);
      this.resetFormAfterSuccess();
    } else {
      this.showErrorMessage(result.message);
    }
  }

  private showSuccessMessage(result: InvoiceSubmissionResult) {
    const message = result.invoiceId
      ? `Invoice generated successfully! ID: ${result.invoiceId}`
      : result.message;

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    setTimeout(() => {
      if (environment.onlyPreviewInvoice) {
        this.previewPdf();
      } else {
        this.confirmDownloadInvoice();
      }
    }, 500);
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Retry', {
      duration: 8000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      this.createInvoice();
    });
  }

  private resetFormAfterSuccess() {
    if (this.invoiceFormComponent) {
      this.invoiceFormComponent.resetForm();
    }
    this.invoicesService.resetWithPdf();
  }

  onFormDataChanged(data: Partial<InvoiceFormData>) {
    this.invoicesService.updateFormData(data);
  }

  onFormValidityChanged(isValid: boolean) {
    this.invoicesService.updateFormValidation(isValid);
  }

  createInvoice() {
    this.invoicesService.submitInvoice().pipe(takeUntil(this.destroy$)).subscribe({});
  }

  resetForm() {
    if (this.invoiceFormComponent) {
      this.invoiceFormComponent.resetForm();
    }
    this.invoicesService.resetForm();
    this.snackBar.dismiss();
    this.snackBar.open('Form has been reset', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  confirmDownloadInvoice() {
    this.confirmDialogService.openConfirmDialog({
      title: 'Download Invoice',
      message: 'Do you want to download the invoice?',
      confirmText: 'Download',
      cancelText: 'Cancel'
    }).subscribe(result => {
      if (result) {
        this.downloadInvoiceAsPdf();
      } else {
        this.invoicesService.clearSubmissionResult();
      }
    });
  }

  previewPdf() {
    const currentPdf = this.invoicesService.getCurrentPdf();
    if (currentPdf) {
      this.invoicesService.previewPdf();
    } else {
      this.snackBar.open('Invoice does not exist', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  downloadInvoiceAsPdf() {
    const currentPdf = this.invoicesService.getCurrentPdf();

    if (currentPdf) {
      this.invoicesService.downloadPdf();
    } else {
      this.snackBar.open('No PDF available for download', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
