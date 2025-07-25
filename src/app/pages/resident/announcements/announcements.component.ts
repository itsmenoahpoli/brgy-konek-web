import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { AnnouncementDetailsModalComponent } from '../../../components/shared/announcement-details-modal/announcement-details-modal.component';

@Component({
  selector: 'app-resident-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
  imports: [
    DashboardLayoutComponent,
    CommonModule,
    FormsModule,
    TitleCasePipe,
    AnnouncementDetailsModalComponent,
  ],
})
export class AnnouncementsComponent {
  announcements: Announcement[] = [];
  search = '';
  statusFilter = '';
  selectedAnnouncement: Announcement | null = null;
  showModal = false;

  constructor(private announcementsService: AnnouncementsService) {
    this.loadAnnouncements();
  }

  get filteredAnnouncements() {
    return this.announcements.filter((a) => {
      const matchesTitle = a.title
        .toLowerCase()
        .includes(this.search.toLowerCase());
      const matchesStatus = this.statusFilter
        ? a.status === this.statusFilter
        : true;
      return matchesTitle && matchesStatus;
    });
  }

  async loadAnnouncements() {
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = data || [];
  }

  onSearchChange(value: string) {
    this.search = value;
  }

  onStatusFilterChange(value: string) {
    this.statusFilter = value;
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
