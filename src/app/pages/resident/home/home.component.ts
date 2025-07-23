import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
