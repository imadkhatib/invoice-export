import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, Validator {
  @Input() label: string = 'Select Date';
  @Input() control!: FormControl;
  @Input() placeholder: string = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';

  value!: Date | null;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate() {
    return this.control?.errors;
  }

  onDateChange(event: any) {
    this.value = event;
    this.onChange(this.value);
    this.onTouched();
  }

  getErrorMessage(): string {
    if (!this.control) return '';
    if (this.control.hasError('required')) return 'This field is required';
    if (this.control.hasError('futureDate')) return `Date cannot be in the future`;
    return this.control.errors ? 'Invalid value' : '';
  }
}
