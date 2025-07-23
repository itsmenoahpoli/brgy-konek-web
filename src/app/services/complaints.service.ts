import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface Complaint {
  _id: string;
  resident_id: string;
  category: string;
  date_of_report: string;
  complaint_content: string;
  attachments: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  private baseUrl = '/complaints';

  async getComplaints(): Promise<Complaint[] | undefined> {
    try {
      const res = await apiClient.get<Complaint[]>(this.baseUrl);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }
}
