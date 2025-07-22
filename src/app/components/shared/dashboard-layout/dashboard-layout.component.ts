import { Component } from '@angular/core';
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
  sidebarOpen = true;
  breadcrumbs: { label: string; url: string }[] = [];
  sidebarLinks = [
    { label: 'Home', icon: 'heroHome', route: '/home' },
    { label: 'Profile', icon: 'heroUser', route: '/profile' },
    { label: 'Settings', icon: 'heroCog', route: '/settings' },
  ];
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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
