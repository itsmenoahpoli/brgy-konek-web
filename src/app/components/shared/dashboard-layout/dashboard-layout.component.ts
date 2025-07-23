import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIcon } from '@ng-icons/core';
import { UserAvatarDropdownComponent } from '../user-avatar-dropdown/user-avatar-dropdown.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, NgIcon, UserAvatarDropdownComponent, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  sidebarOpen = true;
  breadcrumbs: { label: string; url: string }[] = [];
  sidebarLinks: { label: string; icon: string; route: string }[] = [];
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'resident') {
      this.sidebarLinks = [
        { label: 'Complaints', icon: 'heroHome', route: '/complaints' },
        { label: 'Announcements', icon: 'heroUser', route: '/announcements' },
        { label: 'List of Reports', icon: 'heroCog', route: '/reports' },
      ];
    } else if (user?.role === 'admin' || user?.role === 'staff') {
      this.sidebarLinks = [
        { label: 'Dashboard', icon: 'heroHome', route: 'admin/home' },
        {
          label: 'Pending Approval',
          icon: 'heroUser',
          route: 'admin/pending-approval',
        },
        { label: 'Complaints', icon: 'heroCog', route: 'admin/complaints' },
        {
          label: 'Announcements',
          icon: 'heroEye',
          route: 'admin/announcements',
        },
        {
          label: 'Manage Accounts',
          icon: 'heroUserCircle',
          route: 'admin/accounts',
        },
      ];
    } else {
      this.sidebarLinks = [];
    }
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  goToSidebarLink(link: any) {
    this.router.navigate([link.route]);
  }
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = []
  ): { label: string; url: string }[] {
    let children = route.children;
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard Overview', url: '' });
      breadcrumbs.push({ label: 'Home', url: '/home' });
    }
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (let child of children) {
      let routeURL = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '' && routeURL !== 'home') {
        url += `/${routeURL}`;
        let label =
          routeURL.charAt(0).toUpperCase() +
          routeURL.slice(1).replace('-', ' ');
        breadcrumbs.push({ label, url });
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
