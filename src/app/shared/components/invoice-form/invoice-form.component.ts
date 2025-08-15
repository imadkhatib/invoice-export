import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl, FormControl} from '@angular/forms';
import {Subject, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs';
import {CustomValidators} from "../../../common/validators/custom-validators";
import {InvoiceFormData} from "../../../interfaces/invoice.interface";

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  @Input() isSubmitting = false;
  @Input() isLoading = false;
  @Input() triggerReset = false;
  @Output() formDataChanged = new EventEmitter<Partial<InvoiceFormData>>();
  @Output() formValidityChanged = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();
  frmInvoice!: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
    this.setFormSubscriptions();
  }

  private initForm() {
    this.frmInvoice = this.fb.group({
      personalDetails: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        phoneNumber: ['', [CustomValidators.phoneNumber()]]
      }),
      invoiceDetails: this.fb.group({
        invoiceNumber: ['', [
          Validators.required,
          CustomValidators.alphanumeric(),
          Validators.minLength(4),
          Validators.maxLength(15)
        ]],
        amount: ['', [
          Validators.required,
          CustomValidators.positiveNumber(),
          CustomValidators.minAmount(0.01)
        ]],
        invoiceDate: ['', [Validators.required, CustomValidators.notFutureDate()]]
      }),
      signature: [{value: null, disabled: this.isSubmitting}, Validators.required]
    });
  }

  private setFormSubscriptions() {

    this.frmInvoice.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.formDataChanged.emit(value);
      });

    this.frmInvoice.statusChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.formValidityChanged.emit(this.frmInvoice.valid);
      });
  }

  resetForm() {
    this.frmInvoice.reset();

    this.frmInvoice.markAsUntouched();
    this.frmInvoice.markAsPristine();

    this.formDataChanged.emit({});
    this.formValidityChanged.emit(false);
  }

  get personalDetails() {
    return this.frmInvoice.get('personalDetails') as FormGroup;
  }

  get fullName() {
    return this.personalDetails.get('fullName') as FormControl;
  }

  get emailAddress() {
    return this.personalDetails.get('emailAddress') as FormControl;
  }

  get phoneNumber() {
    return this.personalDetails.get('phoneNumber') as FormControl;
  }

  get invoiceDetails() {
    return this.frmInvoice.get('invoiceDetails') as FormGroup;
  }

  get invoiceNumber() {
    return this.invoiceDetails.get('invoiceNumber') as FormControl;
  }

  get amount() {
    return this.invoiceDetails.get('amount') as FormControl;
  }

  get invoiceDate() {
    return this.invoiceDetails.get('invoiceDate') as FormControl;
  }

  get signature() {
    return this.frmInvoice.get('signature') as FormControl;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
