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
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';
import { OtpModalComponent } from '../../components/shared/otp-modal/otp-modal.component';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    StatusModalComponent,
    OtpModalComponent,
    NgIcon,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild(OtpModalComponent) otpModal!: OtpModalComponent;

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessModal = false;
  showOtpLoadingModal = false;
  showOtpSuccessModal = false;
  showOtpModal = false;
  showPassword = false;

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

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (this.authService.isAccountLocked(email)) {
        this.showOtpModal = true;
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log(response);
          this.isLoading = false;
          if (response.success) {
            this.authService.resetLoginAttempts(email);
            const userType = response.user?.role || '';
            this.requestOTPAndRedirect(email, userType);
          } else {
            this.authService.incrementLoginAttempts(email);
            const attempts = this.authService.getLoginAttempts(email);

            if (attempts.count >= 3) {
              this.showOtpModal = true;
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
            this.showOtpModal = true;
          } else {
            this.errorMessage = 'An error occurred during login';
          }
        },
      });
    }
  }

  onOtpRequested(email: string): void {
    this.authService.sendOTP(email).subscribe({
      next: (otpResponse) => {
        if (otpResponse.success) {
          this.otpModal.setOtpRequested();
        } else {
          this.otpModal.setError('Failed to send OTP. Please try again.');
        }
      },
      error: (error) => {
        this.otpModal.setError('Failed to send OTP. Please try again.');
      },
    });
  }

  onOtpVerified(data: { email: string; otp: string }): void {
    this.authService.verifyOTP(data.email, data.otp).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.resetLoginAttempts(data.email);
          this.showOtpModal = false;
          this.otpModal.resetForm();
          this.router.navigate(['/home']);
        } else {
          this.otpModal.setError(
            response.message || 'Invalid OTP. Please try again.'
          );
        }
      },
      error: (error) => {
        this.otpModal.setError('Failed to verify OTP. Please try again.');
      },
    });
  }

  onOtpModalClosed(): void {
    this.showOtpModal = false;
    this.otpModal.resetForm();
  }

  private requestOTPAndRedirect(email: string, userType: string): void {
    this.showOtpLoadingModal = true;
    this.authService.sendOTP(email).subscribe({
      next: (otpResponse) => {
        this.showOtpLoadingModal = false;
        if (otpResponse.success) {
          this.showOtpSuccessModal = true;
          setTimeout(() => {
            this.showOtpSuccessModal = false;
            this.router.navigate(['/verify-otp'], {
              queryParams: { email, user_type: userType },
            });
          }, 2000);
        } else {
          this.errorMessage = 'Failed to send OTP. Please try again.';
        }
      },
      error: (error) => {
        this.showOtpLoadingModal = false;
        this.errorMessage = 'Failed to send OTP. Please try again.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/home']);
  }

  onOtpSuccessModalClosed(): void {
    console.log('OTP success modal closed, redirecting to verify-otp');
    this.showOtpSuccessModal = false;
    const email = this.loginForm.get('email')?.value;
    const userType = this.authService.getCurrentUser()?.role || '';
    console.log('Redirecting to verify-otp with email:', email);
    this.router.navigate(['/verify-otp'], {
      queryParams: { email, user_type: userType },
    });
  }

  testRedirect(): void {
    console.log('Test redirect clicked');
    const email = this.loginForm.get('email')?.value || 'test@example.com';
    const userType = this.authService.getCurrentUser()?.role || '';
    console.log('Testing redirect to verify-otp with email:', email);
    this.router.navigate(['/verify-otp'], {
      queryParams: { email, user_type: userType },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
