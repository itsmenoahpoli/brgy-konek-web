import { Component, OnInit } from '@angular/core';
import { LandingLayoutComponent } from '../../components/shared/landing-layout/landing-layout.component';
import { AnnouncementDetailsModalComponent } from '../../components/shared/announcement-details-modal/announcement-details-modal.component';
import {
  AnnouncementsService,
  Announcement,
} from '../../services/announcements.service';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
  imports: [
    LandingLayoutComponent,
    AnnouncementDetailsModalComponent,
    CommonModule,
    DatePipe,
  ],
  standalone: true,
})
export class AnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  loading = false;
  selectedAnnouncement: Announcement | null = null;
  showModal = false;

  constructor(private announcementsService: AnnouncementsService) {}

  async ngOnInit() {
    this.loading = true;
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = (data || [])
      .filter((a) => a.status === 'published')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    this.loading = false;
  }

  openAnnouncementDetails(announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.showModal = true;
  }

  onModalClosed() {
    this.showModal = false;
    this.selectedAnnouncement = null;
  }
}
