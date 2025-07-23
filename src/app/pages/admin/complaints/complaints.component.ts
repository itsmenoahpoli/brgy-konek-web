import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [DashboardLayoutComponent],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
})
export class ComplaintsComponent {}
