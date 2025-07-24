import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { TitleCasePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    ReactiveFormsModule,
    TitleCasePipe,
    FormsModule,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss',
})
export class AnnouncementsComponent {
  announcements: Announcement[] = [];
  form: FormGroup;
  editId: string | null = null;
  showModal = false;
  search = '';
  statusFilter = '';
  constructor(
    private announcementsService: AnnouncementsService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      banner_image: [''],
      title: [''],
      header: [''],
      body: [''],
      status: [''],
    });
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
  loadAnnouncements() {
    this.announcementsService.getAnnouncements().subscribe((data) => {
      this.announcements = data;
    });
  }
  openModal(editAnnouncement?: Announcement) {
    if (editAnnouncement) {
      this.form.patchValue(editAnnouncement);
      this.editId = editAnnouncement.id;
    } else {
      this.form.reset();
      this.editId = null;
    }
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
    this.form.reset();
    this.editId = null;
  }
  submit() {
    if (this.form.invalid) return;
    if (this.editId) {
      this.announcementsService
        .updateAnnouncement(this.editId, {
          id: this.editId,
          ...this.form.value,
        })
        .subscribe(() => {
          this.editId = null;
          this.form.reset();
          this.loadAnnouncements();
          this.showModal = false;
        });
    } else {
      this.announcementsService
        .addAnnouncement({
          id: uuidv4(),
          ...this.form.value,
        })
        .subscribe(() => {
          this.form.reset();
          this.loadAnnouncements();
          this.showModal = false;
        });
    }
  }
  edit(announcement: Announcement) {
    this.openModal(announcement);
  }
  delete(id: string) {
    this.announcementsService.deleteAnnouncement(id).subscribe(() => {
      this.loadAnnouncements();
    });
  }
  cancelEdit() {
    this.closeModal();
  }
  onSearchChange(value: string) {
    this.search = value;
  }
  onStatusFilterChange(value: string) {
    this.statusFilter = value;
  }
}
