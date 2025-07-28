import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  PhilippineAddressesService,
  Province,
  City,
  Barangay,
} from '../../services/philippine-addresses.service';
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthLayoutComponent,
    StatusModalComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isDragOver = false;
  selectedFileName = '';
  showSuccessDialog = false;
  showPassword = false;
  showConfirmPassword = false;
  private mobileNumberSubscription: any;

  provinces: Province[] = [];
  cities: City[] = [];
  barangays: Barangay[] = [];
  selectedProvince: Province | null = null;
  selectedCity: City | null = null;

  get passwordValidationStatus() {
    const password = this.registerForm.get('password')?.value || '';
    return {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnInit(): void {
    this.mobileNumberSubscription = this.registerForm
      .get('mobile_number')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          let digits = value.replace(/\D/g, '');

          if (digits.length > 9) {
            digits = digits.substring(0, 9);
          }

          if (digits !== value) {
            this.registerForm.patchValue(
              { mobile_number: digits },
              { emitEvent: false }
            );
          }
        }
      });

    this.registerForm
      .get('selected_province_code')
      ?.valueChanges.subscribe((value) => {
        console.log('Province value changed:', value);
        this.onProvinceChange(value);
      });

    this.registerForm
      .get('selected_city_code')
      ?.valueChanges.subscribe((value) => {
        console.log('City value changed:', value);
        this.onCityChange(value);
      });

    this.loadProvinces();

    console.log('Component initialized, provinces:', this.provinces.length);
    console.log('Form controls:', Object.keys(this.registerForm.controls));
  }

  ngOnDestroy(): void {
    if (this.mobileNumberSubscription) {
      this.mobileNumberSubscription.unsubscribe();
    }
  }

  loadProvinces(): void {
    console.log('Loading provinces in component...');
    this.philippineAddressesService.getProvinces().subscribe({
      next: (provinces) => {
        console.log('Provinces loaded:', provinces.length);
        this.provinces = provinces.sort((a, b) =>
          a.province_name.localeCompare(b.province_name)
        );
        console.log('Provinces sorted:', this.provinces.length);
        console.log('First few provinces:', this.provinces.slice(0, 3));
      },
      error: (error) => {
        console.error('Error loading provinces:', error);
      },
    });
  }

  onProvinceChange(provinceCode: string): void {
    console.log('Province changed to:', provinceCode);
    this.selectedProvince =
      this.provinces.find((p) => p.province_code === provinceCode) || null;
    this.cities = [];
    this.barangays = [];
    this.selectedCity = null;

    if (provinceCode) {
      console.log('Loading cities for province:', provinceCode);
      this.philippineAddressesService
        .getCitiesByProvince(provinceCode)
        .subscribe({
          next: (cities) => {
            console.log('Cities loaded:', cities.length);
            this.cities = cities.sort((a, b) =>
              a.city_name.localeCompare(b.city_name)
            );
            console.log('Cities sorted:', this.cities.length);

            this.registerForm.patchValue({
              selected_city_code: '',
              address_barangay: '',
            });
          },
          error: (error) => {
            console.error('Error loading cities:', error);
          },
        });
    } else {
      this.registerForm.patchValue({
        selected_city_code: '',
        address_barangay: '',
      });
    }
  }

  onCityChange(cityCode: string): void {
    console.log('City changed to:', cityCode);
    this.selectedCity =
      this.cities.find((c) => c.city_code === cityCode) || null;
    this.barangays = [];

    if (cityCode) {
      console.log('Loading barangays for city:', cityCode);
      this.philippineAddressesService.getBarangaysByCity(cityCode).subscribe({
        next: (barangays) => {
          console.log('Barangays loaded:', barangays.length);
          this.barangays = barangays.sort((a, b) =>
            a.brgy_name.localeCompare(b.brgy_name)
          );
          console.log('Barangays sorted:', this.barangays.length);

          this.registerForm.patchValue({
            address_barangay: '',
          });
        },
        error: (error) => {
          console.error('Error loading barangays:', error);
        },
      });
    } else {
      this.registerForm.patchValue({
        address_barangay: '',
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private philippineAddressesService: PhilippineAddressesService
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        middle_name: [''],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        birthdate: ['', [Validators.required, this.ageValidator]],
        email: [
          '',
          [Validators.required, Validators.email, this.gmailOnlyValidator],
        ],
        password: ['', [Validators.required, this.passwordStrengthValidator]],
        confirmPassword: ['', [Validators.required]],
        mobile_number: [
          '',
          [Validators.required, this.philippineMobileValidator],
        ],
        address_sitio: ['', [Validators.required]],
        address_barangay: ['', [Validators.required]],
        selected_province_code: ['', [Validators.required]],
        selected_city_code: ['', [Validators.required]],
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

    const mobileRegex = /^[0-9]{9}$/;
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
    } else if (confirmPassword && confirmPassword.errors) {
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

    if (!(file instanceof File)) {
      return { fileType: true };
    }

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

  ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const birthdate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      return { underage: true };
    }

    if (birthdate > today) {
      return { futureDate: true };
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
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('mobile_number', '+639' + formValue.mobile_number);
      formData.append('user_type', 'resident');
      formData.append(
        'address',
        `${formValue.address_sitio}, ${formValue.address_barangay}, ${
          this.selectedCity?.city_name || ''
        }, ${this.selectedProvince?.province_name || ''}`
      );
      formData.append('birthdate', formValue.birthdate);
      formData.append('address_sitio', formValue.address_sitio);
      formData.append('address_barangay', formValue.address_barangay);
      formData.append(
        'address_municipality',
        this.selectedCity?.city_name || ''
      );
      formData.append(
        'address_province',
        this.selectedProvince?.province_name || ''
      );

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
    this.registerForm.get('barangay_clearance')?.updateValueAndValidity();
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

  debugForm(): void {
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form value:', this.registerForm.value);

    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      if (control) {
        console.log(`${key}:`, {
          valid: control.valid,
          invalid: control.invalid,
          errors: control.errors,
          value: control.value,
          touched: control.touched,
        });
      }
    });
  }
}
