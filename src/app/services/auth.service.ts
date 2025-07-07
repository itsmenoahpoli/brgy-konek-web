import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
    return new Observable((observer) => {
      fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              phone: data.user.mobile_number,
              address: data.user.address,
              barangay: data.user.barangay,
              city: data.user.city,
              province: data.user.province,
            };

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next({
              success: true,
              message: data.message || 'Login successful',
              user,
            });
          } else {
            observer.next({
              success: false,
              message: data.message || 'Invalid email or password',
            });
          }
          observer.complete();
        })
        .catch((error) => {
          observer.next({
            success: false,
            message: 'Network error occurred',
          });
          observer.complete();
        });
    });
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
    return new Observable((observer) => {
      const isFormData = userData instanceof FormData;
      const headers: Record<string, string> = {};

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers,
        body: isFormData ? userData : JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              phone: data.user.mobile_number,
              address: data.user.address,
              barangay: data.user.barangay,
              city: data.user.city,
              province: data.user.province,
            };

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next({
              success: true,
              message: data.message || 'Registration successful',
              user,
            });
          } else {
            observer.next({
              success: false,
              message: data.message || 'Registration failed',
            });
          }
          observer.complete();
        })
        .catch((error) => {
          observer.next({
            success: false,
            message: 'Network error occurred',
          });
          observer.complete();
        });
    });
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
}
