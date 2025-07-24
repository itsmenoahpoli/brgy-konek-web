import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { TitleCasePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { ConfirmDeleteModalComponent } from '../../../components/shared/confirm-delete-modal.component';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    ReactiveFormsModule,
    TitleCasePipe,
    FormsModule,
    CommonModule,
    StatusModalComponent,
    ConfirmDeleteModalComponent,
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
  bannerImagePreview: string | null = null;
  statusModalVisible = false;
  statusModalTitle = '';
  statusModalMessage = '';
  confirmDeleteVisible = false;
  deleteId: string | null = null;
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
  async loadAnnouncements() {
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = data || [];
  }
  openModal(editAnnouncement?: Announcement) {
    if (editAnnouncement) {
      this.form.patchValue(editAnnouncement);
      this.editId = editAnnouncement._id;
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
  async submit() {
    if (this.form.invalid) return;
    if (this.editId) {
      await this.announcementsService.updateAnnouncement(this.editId, {
        ...this.form.value,
      });
      this.editId = null;
      this.form.reset();
      await this.loadAnnouncements();
      this.showModal = false;
      this.statusModalTitle = 'Announcement Updated';
      this.statusModalMessage = 'The announcement was updated successfully.';
      this.statusModalVisible = true;
    } else {
      await this.announcementsService.addAnnouncement({
        ...this.form.value,
      });
      this.form.reset();
      await this.loadAnnouncements();
      this.showModal = false;
      this.statusModalTitle = 'Announcement Created';
      this.statusModalMessage = 'The announcement was created successfully.';
      this.statusModalVisible = true;
    }
  }
  edit(announcement: Announcement) {
    this.openModal(announcement);
  }
  async delete(id: string) {
    this.deleteId = id;
    this.confirmDeleteVisible = true;
  }
  async onConfirmDelete() {
    if (this.deleteId) {
      const res = await this.announcementsService.deleteAnnouncement(
        this.deleteId
      );
      if (res && res.status === 204) {
        this.statusModalTitle = 'Deleted';
        this.statusModalMessage = 'Successfully deleted announcement.';
        this.statusModalVisible = true;
      }
      await this.loadAnnouncements();
      this.deleteId = null;
      this.confirmDeleteVisible = false;
    }
  }
  onCancelDelete() {
    this.confirmDeleteVisible = false;
    this.deleteId = null;
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
  onBannerImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerImagePreview = reader.result as string;
        this.form.patchValue({ banner_image: this.bannerImagePreview });
      };
      reader.readAsDataURL(file);
    }
  }
  onStatusModalClosed() {
    this.statusModalVisible = false;
  }
}
