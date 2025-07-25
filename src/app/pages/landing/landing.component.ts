import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LandingLayoutComponent } from '../../components/shared/landing-layout/landing-layout.component';
import {
  AnnouncementsService,
  Announcement,
} from '../../services/announcements.service';
import { DatePipe, CommonModule } from '@angular/common';
import {
  heroMegaphone,
  heroExclamationCircle,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [LandingLayoutComponent, CommonModule, DatePipe],
  standalone: true,
})
export class LandingComponent implements OnInit {
  heroMegaphone = heroMegaphone;
  heroExclamationCircle = heroExclamationCircle;
  announcements: Announcement[] = [];
  loading = false;
  constructor(
    private router: Router,
    private announcementsService: AnnouncementsService
  ) {}
  async ngOnInit() {
    this.loading = true;
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = (data || [])
      .filter((a) => a.status === 'published')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 6);
    this.loading = false;
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  navigateToAnnouncements() {
    this.router.navigate(['/announcements']);
  }
}
