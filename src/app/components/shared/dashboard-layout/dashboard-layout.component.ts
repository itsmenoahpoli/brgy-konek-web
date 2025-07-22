import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIcon } from '@ng-icons/core';
import { UserAvatarDropdownComponent } from '../user-avatar-dropdown/user-avatar-dropdown.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, NgIcon, UserAvatarDropdownComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent {
  sidebarOpen = true;
  constructor(private authService: AuthService, private router: Router) {}
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
