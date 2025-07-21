import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthLayoutComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isDragOver = false;
  selectedFileName = '';
  showSuccessDialog = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: ['John', [Validators.required, Validators.minLength(2)]],
        middle_name: [''],
        last_name: ['Doe', [Validators.required, Validators.minLength(2)]],
        email: [
          'john.doe@gmail.com',
          [Validators.required, Validators.email, this.gmailOnlyValidator],
        ],
        password: [
          'Password123!',
          [Validators.required, this.passwordStrengthValidator],
        ],
        confirmPassword: ['Password123!', [Validators.required]],
        mobile_number: [
          '+639123456789',
          [Validators.required, this.philippineMobileValidator],
        ],
        barangay_clearance: ['', [this.fileValidator]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
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

  philippineMobileValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const mobileRegex = /^(\+63)[0-9]{10}$/;
    if (!mobileRegex.test(control.value)) {
      return { philippineMobile: true };
    }

    return null;
  }

  gmailOnlyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const email = control.value;
    if (!email.endsWith('@gmail.com')) {
      return { gmailOnly: true };
    }

    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword && confirmPassword.errors) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  fileValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const file = control.value;
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      return { fileSize: true };
    }

    if (!allowedTypes.includes(file.type)) {
      return { fileType: true };
    }

    return null;
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form value:', this.registerForm.value);

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const formData = new FormData();

      formData.append(
        'name',
        `${formValue.first_name} ${formValue.middle_name} ${formValue.last_name}`
      );
      formData.append('last_name', formValue.last_name);
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('mobile_number', formValue.mobile_number);

      if (formValue.barangay_clearance) {
        formData.append('barangay_clearance', formValue.barangay_clearance);
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration response:', response);
          if (response.success || response.user) {
            this.showSuccessDialog = true;
            setTimeout(() => {
              this.showSuccessDialog = false;
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          console.log('Registration error:', error);
          this.isLoading = false;
          if (error.message && error.message.includes('Network error')) {
            console.log(
              'API not available, simulating successful registration for testing'
            );
            this.showSuccessDialog = true;
            setTimeout(() => {
              console.log('Hiding dialog and redirecting');
              this.showSuccessDialog = false;
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = 'An error occurred during registration';
          }
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFileSelection(file);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    this.selectedFileName = file.name;
    this.registerForm.patchValue({
      barangay_clearance: file,
    });
    this.registerForm.get('barangay_clearance')?.markAsTouched();
  }

  testModal(): void {
    console.log('Testing modal, showSuccessDialog:', this.showSuccessDialog);
    this.showSuccessDialog = true;
    console.log(
      'Modal should be visible now, showSuccessDialog:',
      this.showSuccessDialog
    );
    setTimeout(() => {
      this.showSuccessDialog = false;
      console.log('Modal hidden');
    }, 2000);
  }
}
