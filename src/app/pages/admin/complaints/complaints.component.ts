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

    console.log(response);
    this.complaints = response ?? [];
  }
}
