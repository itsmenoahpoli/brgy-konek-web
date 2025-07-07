import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        middle_name: [''],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        mobile_number: [
          '',
          [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)],
        ],
        barangay_clearance: ['', [Validators.required, this.fileValidator]],
      },
      { validators: this.passwordMatchValidator }
    );
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
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const formData = new FormData();

      formData.append('first_name', formValue.first_name);
      formData.append('middle_name', formValue.middle_name);
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
          if (response.success) {
            this.router.navigate(['/profile']);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'An error occurred during registration';
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
}
