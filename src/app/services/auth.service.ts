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
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'password') {
          const user: User = {
            id: '1',
            email: email,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+639123456789',
            address: '123 Main Street',
            barangay: 'Barangay 1',
            city: 'Manila',
            province: 'Metro Manila',
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          observer.next({ success: true, message: 'Login successful', user });
        } else {
          observer.next({
            success: false,
            message: 'Invalid email or password',
          });
        }
        observer.complete();
      }, 1000);
    });
  }

  register(
    userData: Omit<User, 'id'>
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const user: User = {
          id: Date.now().toString(),
          ...userData,
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        observer.next({
          success: true,
          message: 'Registration successful',
          user,
        });
        observer.complete();
      }, 1000);
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
