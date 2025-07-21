import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { ApiService } from '../utils/api.util';

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
}

interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
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
      ApiService.post<ApiUser>('/auth/login', { email, password }).then(
        (response) => {
          if (response.success && response.user) {
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              firstName: response.user.first_name,
              lastName: response.user.last_name,
              phone: response.user.mobile_number,
              address: response.user.address,
              barangay: response.user.barangay,
              city: response.user.city,
              province: response.user.province,
            };

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return {
              success: true,
              message: response.message || 'Login successful',
              user,
            };
          } else {
            return {
              success: false,
              message: response.message || 'Invalid email or password',
            };
          }
        }
      )
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

        if (isFormData) {
          const response = await ApiService.postFormData<ApiUser>(
            '/auth/register',
            userData
          );
          if (response.success || response.status === 201) {
            if (response.user) {
              const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                phone: response.user.mobile_number,
                address: response.user.address,
                barangay: response.user.barangay,
                city: response.user.city,
                province: response.user.province,
              };

              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
              return {
                success: true,
                message: response.message || 'Registration successful',
                user,
              };
            } else {
              return {
                success: true,
                message: response.message || 'Registration successful',
              };
            }
          } else {
            return {
              success: false,
              message: response.message || 'Registration failed',
            };
          }
        } else {
          const response = await ApiService.post<ApiUser>(
            '/auth/register',
            userData
          );
          if (response.success || response.status === 201) {
            if (response.user) {
              const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                phone: response.user.mobile_number,
                address: response.user.address,
                barangay: response.user.barangay,
                city: response.user.city,
                province: response.user.province,
              };

              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
              return {
                success: true,
                message: response.message || 'Registration successful',
                user,
              };
            } else {
              return {
                success: true,
                message: response.message || 'Registration successful',
              };
            }
          } else {
            return {
              success: false,
              message: 'Registration failed',
            };
          }
        }
      })()
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
      ApiService.post('/auth/send-otp', { email }).then((response) => ({
        success: response.success,
        message: response.message || 'OTP sent successfully',
      }))
    );
  }

  verifyOTP(
    email: string,
    otp: string
  ): Observable<{ success: boolean; message: string }> {
    return from(
      ApiService.post('/auth/verify-otp', { email, otp }).then((response) => {
        if (response.success) {
          this.resetLoginAttempts(email);
        }
        return {
          success: response.success,
          message: response.message || 'OTP verification failed',
        };
      })
    );
  }
}
