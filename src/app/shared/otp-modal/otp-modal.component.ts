import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-modal.component.html',
  styles: [],
})
export class OtpModalComponent {
  @Input() isVisible = false;
  @Input() email = '';
  @Output() otpVerified = new EventEmitter<{ email: string; otp: string }>();
  @Output() otpRequested = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  emailForm: FormGroup;
  otpForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isOtpRequested = false;

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  onRequestOTP(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.emailForm.get('email')?.value;
      this.otpRequested.emit(email);
    }
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.emailForm.get('email')?.value;
      const otp = this.otpForm.get('otp')?.value;
      this.otpVerified.emit({ email, otp });
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }

  resetForm(): void {
    this.emailForm.reset();
    this.otpForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
    this.isOtpRequested = false;
  }

  setOtpRequested(): void {
    this.isOtpRequested = true;
    this.isLoading = false;
    this.errorMessage = '';
  }

  setError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
}
