import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import apiClient from '../utils/api.util';

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface OverviewStatistics {
  totalComplaints: number;
  totalActiveAnnouncements: number;
  totalResidents: number;
  complaintsPerMonth: MonthlyCount[];
  announcementsPerMonth: MonthlyCount[];
  usersPerMonth: MonthlyCount[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getOverviewStatistics(): Observable<OverviewStatistics> {
    return from(
      apiClient
        .get<OverviewStatistics>('/administrator/overview-statistics')
        .then((res) => res.data)
    );
  }
}
