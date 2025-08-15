
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
      return phoneRegex.test(control.value.trim()) ? null : { invalidPhoneNumber: true };
    };
  }

  static alphanumeric(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      return alphanumericRegex.test(control.value.trim()) ? null : { invalidAlphanumeric: true };
    };
  }

  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;

      const num = parseFloat(control.value);
      return !isNaN(num) && num > 0 ? null : { notPositive: true };
    };
  }

  static notFutureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      return selectedDate <= today ? null : { futureDate: true };
    };
  }

  static minAmount(minValue: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;

      const num = parseFloat(control.value);
      return !isNaN(num) && num >= minValue ? null : { minAmount: { requiredMin: minValue, actualValue: num } };
    };
  }
}
