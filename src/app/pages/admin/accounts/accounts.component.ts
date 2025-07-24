import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UsersService, User } from '../../../services/users.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    DatePipe,
    FormsModule,
    StatusModalComponent,
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  users: User[] = [];
  currentUserId: string | undefined;
  searchTerm = '';
  isCreateUserModalVisible = false;
  createUserForm = {
    name: '',
    email: '',
    mobile_number: '',
    user_type: 'resident',
    address: '',
    birthdate: '',
    barangay_clearance: null as File | null,
    password: '',
  };
  isSubmitting = false;
  createUserError = '';
  mobileNumberError = '';
  passwordError = '';
  showPassword = true;
  showStatusModal = false;
  statusModalType: 'success' | 'error' | 'info' = 'success';
  statusModalTitle = '';
  statusModalMessage = '';

  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}
  async ngOnInit(): Promise<void> {
    this.users = (await this.usersService.getUsers()) || [];
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id;
  }
  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(
      (user) =>
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.mobile_number.includes(term)
    );
  }
  editUser(user: User) {}
  deleteUser(user: User) {}
  openCreateUserModal() {
    this.isCreateUserModalVisible = true;
    this.createUserForm = {
      name: '',
      email: '',
      mobile_number: '',
      user_type: 'resident',
      address: '',
      birthdate: '',
      barangay_clearance: null,
      password: '',
    };
    this.createUserError = '';
    this.showPassword = true;
  }

  closeCreateUserModal() {
    this.isCreateUserModalVisible = false;
    this.createUserError = '';
  }

  onBarangayClearanceChange(file: File | null) {
    this.createUserForm.barangay_clearance = file;
  }

  validateMobileNumber() {
    const value = this.createUserForm.mobile_number;
    const mobileRegex = /^(\+63)[0-9]{10}$/;
    if (!value) {
      this.mobileNumberError = 'Mobile number is required';
      return false;
    }
    if (!mobileRegex.test(value)) {
      this.mobileNumberError =
        'Please enter a valid Philippine mobile number (e.g., +639123456789)';
      return false;
    }
    this.mobileNumberError = '';
    return true;
  }

  get passwordValidationStatus() {
    const password = this.createUserForm.password || '';
    return {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  validatePassword() {
    const password = this.createUserForm.password || '';
    const minLength = 8;
    const maxLength = 20;
    if (!password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (password.length < minLength || password.length > maxLength) {
      this.passwordError = 'Password must be 8-20 characters';
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      this.passwordError = 'Password must have at least one uppercase letter';
      return false;
    }
    if (!/[a-z]/.test(password)) {
      this.passwordError = 'Password must have at least one lowercase letter';
      return false;
    }
    if (!/\d/.test(password)) {
      this.passwordError = 'Password must have at least one number';
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.passwordError = 'Password must have at least one special character';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  generatePassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    const all = upper + lower + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    password = password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    this.createUserForm.password = password;
    this.validatePassword();
  }

  closeStatusModal() {
    this.showStatusModal = false;
  }

  async submitCreateUser() {
    if (!this.validateMobileNumber() || !this.validatePassword()) {
      this.isSubmitting = false;
      return;
    }
    this.isSubmitting = true;
    this.createUserError = '';
    try {
      let payload: any = { ...this.createUserForm };
      if (this.createUserForm.barangay_clearance) {
        const formData = new FormData();
        for (const key in payload) {
          if (key === 'barangay_clearance' && payload[key]) {
            formData.append('barangay_clearance', payload[key]);
          } else {
            formData.append(key, payload[key]);
          }
        }
        payload = formData;
      } else {
        payload.barangay_clearance = null;
      }
      const user = await this.usersService.createUser(payload);
      if (user) {
        this.users.push(user);
        this.closeCreateUserModal();
        this.statusModalType = 'success';
        this.statusModalTitle = 'User Created';
        this.statusModalMessage = 'The user account was created successfully.';
        this.showStatusModal = true;
        setTimeout(() => this.closeStatusModal(), 2000);
      } else {
        this.createUserError = 'Failed to create user.';
      }
    } catch (e) {
      this.createUserError = 'Failed to create user.';
    }
    this.isSubmitting = false;
  }
}
