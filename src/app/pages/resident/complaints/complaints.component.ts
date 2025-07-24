import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { NgIcon } from '@ng-icons/core';
import {
  ComplaintsService,
  Complaint,
  Resident,
} from '../../../services/complaints.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDeleteModalComponent } from '../../../components/shared/confirm-delete-modal.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-resident-complaints',
  standalone: true,
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    NgIcon,
    ConfirmDeleteModalComponent,
    StatusModalComponent,
  ],
})
export class ComplaintsComponent {
  complaints: Complaint[] = [];
  statusList = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  categoryList = ['Noise', 'Garbage', 'Vandalism', 'Other'];
  selectedStatus = '';
  selectedCategory = '';
  showCreateModal = false;
  uploadedFiles: File[] = [];
  isDragOver = false;
  complaintTitle = '';
  complaintCategory = '';
  complaintDate = '';
  complaintContent = '';
  complaintStatus = 'Published';
  showDeleteModal = false;
  complaintToDelete: Complaint | null = null;
  showSuccessModal = false;

  constructor(
    private complaintsService: ComplaintsService,
    private authService: AuthService
  ) {
    this.loadComplaints();
  }

  async loadComplaints() {
    const data = await this.complaintsService.getComplaintsByResidentId(
      this.authService
    );
    this.complaints = data || [];
  }

  get filteredComplaints() {
    return this.complaints.filter(
      (c) =>
        (this.selectedStatus ? c.status === this.selectedStatus : true) &&
        (this.selectedCategory ? c.category === this.selectedCategory : true)
    );
  }

  onCreateComplaint() {
    this.showCreateModal = true;
    this.uploadedFiles = [];
    this.isDragOver = false;
  }
  closeCreateModal() {
    this.showCreateModal = false;
    this.uploadedFiles = [];
    this.isDragOver = false;
  }
  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  addFiles(files: File[]) {
    for (const file of files) {
      if (
        !this.uploadedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        )
      ) {
        this.uploadedFiles.push(file);
      }
    }
  }
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
  getFileExtension(file: File): string {
    const parts = file.name.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }
  onEditComplaint(complaint: Complaint) {
    // Edit logic here
  }
  onDeleteComplaint(complaint: Complaint) {
    this.complaintToDelete = complaint;
    this.showDeleteModal = true;
  }
  async confirmDeleteComplaint() {
    if (!this.complaintToDelete) return;
    const deleted = await this.complaintsService.deleteComplaint(
      this.complaintToDelete._id
    );
    this.showDeleteModal = false;
    this.complaintToDelete = null;
    if (deleted) {
      this.showSuccessModal = true;
      this.loadComplaints();
    }
  }
  onDeleteModalClosed() {
    this.showDeleteModal = false;
    this.complaintToDelete = null;
  }
  onSuccessModalClosed() {
    this.showSuccessModal = false;
  }

  async submitComplaint() {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const attachments = await this.mockUploadFiles(this.uploadedFiles);
    const payload = {
      resident_id: user.id,
      category: this.complaintCategory,
      date_of_report: new Date(this.complaintDate).toISOString(),
      complaint_content: this.complaintContent,
      attachments,
      status: this.complaintStatus.toLowerCase(),
    };
    await this.complaintsService.createComplaint(payload);
    this.closeCreateModal();
    this.loadComplaints();
  }

  async mockUploadFiles(files: File[]): Promise<string[]> {
    const results: string[] = [];
    for (const file of files) {
      const base64 = await this.fileToBase64(file);
      results.push(base64 as string);
    }
    return results;
  }

  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
