import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { OtpModalComponent } from '../../shared/otp-modal/otp-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    OtpModalComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild(OtpModalComponent) otpModal?: OtpModalComponent;
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showOtpModal = false;
  otpEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (this.authService.isAccountLocked(email)) {
        this.otpEmail = email;
        this.showOtpModal = true;
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.authService.resetLoginAttempts(email);
            this.router.navigate(['/profile']);
          } else {
            this.authService.incrementLoginAttempts(email);
            const attempts = this.authService.getLoginAttempts(email);

            if (attempts.count >= 3) {
              this.otpEmail = email;
              this.showOtpModal = true;
              this.authService.sendOTP(email).subscribe({
                next: (otpResponse) => {
                  if (!otpResponse.success) {
                    this.errorMessage = 'Failed to send OTP. Please try again.';
                  }
                },
                error: () => {
                  this.errorMessage = 'Failed to send OTP. Please try again.';
                },
              });
            } else {
              this.errorMessage = response.message;
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.authService.incrementLoginAttempts(email);
          const attempts = this.authService.getLoginAttempts(email);

          if (attempts.count >= 3) {
            this.otpEmail = email;
            this.showOtpModal = true;
            this.authService.sendOTP(email).subscribe({
              next: (otpResponse) => {
                if (!otpResponse.success) {
                  this.errorMessage = 'Failed to send OTP. Please try again.';
                }
              },
              error: () => {
                this.errorMessage = 'Failed to send OTP. Please try again.';
              },
            });
          } else {
            this.errorMessage = 'An error occurred during login';
          }
        },
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onOtpVerified(data: { email: string; otp: string }): void {
    if (data.email && data.otp) {
      this.authService.verifyOTP(data.email, data.otp).subscribe({
        next: (response) => {
          if (response.success) {
            this.showOtpModal = false;
            this.otpModal?.resetForm();
            this.errorMessage = '';
          } else {
            this.otpModal!.errorMessage = response.message;
            this.otpModal!.isLoading = false;
          }
        },
        error: () => {
          this.otpModal!.errorMessage =
            'Failed to verify OTP. Please try again.';
          this.otpModal!.isLoading = false;
        },
      });
    }
  }

  onModalClosed(): void {
    this.showOtpModal = false;
    this.otpModal?.resetForm();
  }
}
