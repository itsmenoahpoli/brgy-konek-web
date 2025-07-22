import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
        newPassword: [
          '',
          [Validators.required, this.passwordStrengthValidator],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userEmail = params['email'] || '';
    });
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  passwordStrengthValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    const password = control.value;
    const minLength = 8;
    const maxLength = 20;
    if (password.length < minLength || password.length > maxLength) {
      return { passwordLength: { min: minLength, max: maxLength } };
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const errors: any = {};
    if (!hasUpperCase) {
      errors.passwordUppercase = true;
    }
    if (!hasLowerCase) {
      errors.passwordLowercase = true;
    }
    if (!hasNumbers) {
      errors.passwordNumber = true;
    }
    if (!hasSpecialChar) {
      errors.passwordSpecial = true;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  get passwordValidationStatus() {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const formData = this.resetPasswordForm.value;
      this.authService
        .resetPassword(this.userEmail, formData.otp, formData.newPassword)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.successMessage =
                'Password reset successfully! Redirecting to login...';
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            } else {
              this.errorMessage =
                response.message ||
                'Invalid reset code. Please check your email and try again.';
            }
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Failed to reset password. Please try again.';
          },
        });
    }
  }
}
