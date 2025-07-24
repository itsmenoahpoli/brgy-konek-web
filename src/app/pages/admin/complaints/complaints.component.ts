import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ComplaintsService,
  Complaint,
} from '../../../services/complaints.service';
import { Observable } from 'rxjs';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
})
export class ComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  showViewModal = false;
  selectedComplaint: Complaint | null = null;
  displayedColumns = [
    'resident_id',
    'category',
    'date_of_report',
    'complaint_content',
    'attachments',
    'status',
    'created_at',
    'updated_at',
  ];
  constructor(private complaintsService: ComplaintsService) {}
  async ngOnInit(): Promise<void> {
    const response = await this.complaintsService.getComplaints();
    if (!response) {
      this.complaints = [];
      return;
    }
    const complaintsWithResidents = await Promise.all(
      response.map(async (complaint) => {
        if (typeof complaint.resident_id === 'string') {
          const resident = await this.complaintsService.getResidentById(
            complaint.resident_id
          );
          return {
            ...complaint,
            resident_id: resident ?? {
              _id: complaint.resident_id,
              name: 'Unknown',
              email: '',
              mobile_number: '',
              user_type: '',
              address: '',
              birthdate: '',
              barangay_clearance: '',
            },
          };
        }
        return complaint;
      })
    );
    this.complaints = complaintsWithResidents;
  }
  openViewModal(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.showViewModal = true;
  }
  closeViewModal() {
    this.showViewModal = false;
    this.selectedComplaint = null;
  }
}
