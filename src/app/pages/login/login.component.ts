import { Component } from '@angular/core';
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
import { SuccessModalComponent } from '../../shared/success-modal/success-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    SuccessModalComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessModal = false;
  showOtpLoadingModal = false;
  showOtpSuccessModal = false;

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
        this.requestOTPAndRedirect(email);
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.authService.resetLoginAttempts(email);
            this.requestOTPAndRedirect(email);
          } else {
            this.authService.incrementLoginAttempts(email);
            const attempts = this.authService.getLoginAttempts(email);

            if (attempts.count >= 3) {
              this.requestOTPAndRedirect(email);
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
            this.requestOTPAndRedirect(email);
          } else {
            this.errorMessage = 'An error occurred during login';
          }
        },
      });
    }
  }

  private requestOTPAndRedirect(email: string): void {
    console.log('Requesting OTP for email:', email);
    this.showOtpLoadingModal = true;
    this.authService.sendOTP(email).subscribe({
      next: (otpResponse) => {
        console.log('OTP response:', otpResponse);
        this.showOtpLoadingModal = false;
        if (otpResponse.success) {
          console.log('OTP sent successfully, showing success modal');
          this.showOtpSuccessModal = true;
          setTimeout(() => {
            console.log('Auto redirecting to verify-otp after 2 seconds');
            this.showOtpSuccessModal = false;
            this.router.navigate(['/verify-otp'], { queryParams: { email } });
          }, 2000);
        } else {
          this.errorMessage = 'Failed to send OTP. Please try again.';
        }
      },
      error: (error) => {
        console.log('OTP request error:', error);
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
    this.router.navigate(['/profile']);
  }

  onOtpSuccessModalClosed(): void {
    console.log('OTP success modal closed, redirecting to verify-otp');
    this.showOtpSuccessModal = false;
    const email = this.loginForm.get('email')?.value;
    console.log('Redirecting to verify-otp with email:', email);
    this.router.navigate(['/verify-otp'], { queryParams: { email } });
  }

  testRedirect(): void {
    console.log('Test redirect clicked');
    const email = this.loginForm.get('email')?.value || 'test@example.com';
    console.log('Testing redirect to verify-otp with email:', email);
    this.router.navigate(['/verify-otp'], { queryParams: { email } });
  }
}
