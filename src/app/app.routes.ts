import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/resident/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./pages/verify-otp/verify-otp.component').then(
        (m) => m.VerifyOtpComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import(
        './components/shared/dashboard-layout/dashboard-layout.component'
      ).then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./pages/admin/accounts/accounts.component').then(
            (m) => m.AccountsComponent
          ),
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import('./pages/admin/announcements/announcements.component').then(
            (m) => m.AnnouncementsComponent
          ),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./pages/admin/complaints/complaints.component').then(
            (m) => m.ComplaintsComponent
          ),
      },
    ],
  },
];
