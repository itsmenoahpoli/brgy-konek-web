import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    StatusModalComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSuccessModal = false;
  successModalMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const email = this.forgotPasswordForm.get('email')?.value;
      this.authService.sendOTP(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successModalMessage =
              'Reset code sent to your email. Please check your inbox.';
            this.showSuccessModal = true;
            setTimeout(() => {
              this.showSuccessModal = false;
              this.router.navigate(['/reset-password'], {
                queryParams: { email: email },
              });
            }, 2000);
          } else {
            this.errorMessage =
              response.message ||
              'Failed to send reset code. Please try again.';
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to send reset code. Please try again.';
        },
      });
    }
  }

  onSuccessModalClosed() {
    this.showSuccessModal = false;
  }
}
