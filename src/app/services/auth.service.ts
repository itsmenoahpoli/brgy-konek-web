import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import apiClient, { encrypt } from '../utils/api.util';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  role?: string;
}

interface ApiUser {
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile_number?: string;
    user_type?: string;
    address?: string;
    birthdate?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private loginAttempts = new Map<
    string,
    { count: number; lockedUntil?: number }
  >();

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(
    email: string,
    password: string
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return from(
      apiClient
        .post<ApiUser>('/auth/login', { email, password })
        .then((response) => {
          const data = response.data;
          if (data && data.token) {
            localStorage.setItem('accessToken', encrypt(data.token));
          }
          if (data && data.user && data.user.id) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.name,
              lastName: '',
              phone: data.user.mobile_number,
              address: data.user.address,
              barangay: '',
              city: '',
              province: '',
              role: data.user.user_type,
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return {
              success: true,
              message: data.message || 'Login successful',
              user,
            };
          } else {
            return {
              success: false,
              message: data?.message || 'Invalid email or password',
            };
          }
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  register(
    userData:
      | FormData
      | {
          first_name: string;
          middle_name?: string;
          last_name: string;
          email: string;
          password: string;
          mobile_number: string;
        }
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return from(
      (async () => {
        const isFormData = userData instanceof FormData;
        let response;
        if (isFormData) {
          response = await apiClient.post<ApiUser>('/auth/register', userData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          response = await apiClient.post<ApiUser>('/auth/register', userData);
        }
        const data = response.data;
        if (data && data.user && (data.user.id || response.status === 201)) {
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.name,
            lastName: '',
            phone: data.user.mobile_number,
            address: data.user.address,
            barangay: '',
            city: '',
            province: '',
            role: data.user.user_type,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return {
            success: true,
            message: data.message || 'Registration successful',
            user,
          };
        } else {
          return {
            success: false,
            message: data?.message || 'Registration failed',
          };
        }
      })().catch((error) => {
        return {
          success: false,
          message: error.response?.data?.message || 'Network error occurred',
        };
      })
    );
  }

  updateProfile(
    userData: Partial<User>
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
          observer.next({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
          });
        } else {
          observer.next({ success: false, message: 'No user logged in' });
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getLoginAttempts(email: string): { count: number; lockedUntil?: number } {
    return this.loginAttempts.get(email) || { count: 0 };
  }

  incrementLoginAttempts(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0 };
    attempts.count += 1;

    if (attempts.count >= 3) {
      attempts.lockedUntil = Date.now() + 5 * 60 * 1000;
    }

    this.loginAttempts.set(email, attempts);
  }

  resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return true;
    }

    if (attempts.count >= 3 && !attempts.lockedUntil) {
      return true;
    }

    return false;
  }

  sendOTP(email: string): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/request-otp', { email })
        .then((response) => {
          const data = response.data;
          return {
            success: data.success,
            message: data.message || 'OTP sent successfully',
          };
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  verifyOTP(
    email: string,
    otp: string
  ): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/verify-otp', { email, otp_code: otp })
        .then((response) => {
          const data = response.data;
          return {
            success: data.success,
            message: data.message || 'OTP verified successfully',
          };
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  resetPassword(
    email: string,
    otp_code: string,
    new_password: string
  ): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/reset-password', {
          email,
          otp_code,
          new_password,
        })
        .then((response) => ({
          success: response.data.success,
          message:
            response.data.message ||
            (response.data.success
              ? 'Password reset successful'
              : 'Password reset failed'),
        }))
    );
  }
}
