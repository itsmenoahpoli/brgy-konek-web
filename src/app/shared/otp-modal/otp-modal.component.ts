import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <div class="text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
            >
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Account Locked
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              Your account has been locked due to multiple failed login
              attempts. Please enter the one-time password sent to your email to
              unlock your account.
            </p>
          </div>

          <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label
                for="otp"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                One-Time Password
              </label>
              <input
                id="otp"
                type="text"
                formControlName="otp"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter OTP"
                maxlength="6"
              />
            </div>

            <div
              *ngIf="errorMessage"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            >
              {{ errorMessage }}
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                (click)="onCancel()"
                class="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="otpForm.invalid || isLoading"
                class="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class OtpModalComponent {
  @Input() isVisible = false;
  @Input() email = '';
  @Output() otpVerified = new EventEmitter<{ email: string; otp: string }>();
  @Output() modalClosed = new EventEmitter<void>();

  otpForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.otpForm.get('email')?.value;
      const otp = this.otpForm.get('otp')?.value;
      this.otpVerified.emit({ email, otp });
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }

  resetForm(): void {
    this.otpForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }
}
