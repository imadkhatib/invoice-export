import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  @Input() control!: FormControl;
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() icon: string = '';

  get showError(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  getErrorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return 'Invalid input';

    if (this.control.hasError('required')) return `${this.label} is required`;
    if (this.control.hasError('email')) return `Invalid email format`;
    if (this.control.hasError('pattern')) return `Invalid format`;
    if (this.control.hasError('min')) return `Value must be greater than 0`;
    if (this.control.hasError('invalidPhoneNumber')) return `Invalid phone number format`;
    if (this.control.hasError('invalidAlphanumeric')) return `Only letters and numbers are allowed`;
    if (this.control.hasError('notPositive')) return `Amount must be greater than zero`;
    if (this.control.hasError('minAmount')) {
      const minAmountError = errors['minAmount'] as { requiredMin: number; actualValue: number };
      return `Minimum amount is $${minAmountError.requiredMin}`;
    }
    if (this.control.hasError('signatureRequired')) return `Signature is required`;
    if (this.control.hasError('minlength')) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (this.control.hasError('maxlength')) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    return 'Invalid input';
  }
}
