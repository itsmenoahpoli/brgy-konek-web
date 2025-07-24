import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface Announcement {
  _id: string;
  banner_image: string;
  title: string;
  header: string;
  body: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private baseUrl = '/announcements';

  async getAnnouncements(): Promise<Announcement[] | undefined> {
    try {
      const res = await apiClient.get<Announcement[]>(this.baseUrl);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async addAnnouncement(announcement: Announcement): Promise<any> {
    try {
      const res = await apiClient.post(this.baseUrl, {
        posted_by: 'admin',
        title_slug: announcement.title.toLowerCase().replace(/ /g, '-'),
        ...announcement,
      });
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateAnnouncement(
    _id: string,
    announcement: Announcement
  ): Promise<any> {
    try {
      const res = await apiClient.put(`${this.baseUrl}/${_id}`, announcement);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async deleteAnnouncement(_id: string): Promise<any> {
    try {
      const res = await apiClient.delete(`${this.baseUrl}/${_id}`);
      return res;
    } catch (error) {
      return undefined;
    }
  }
}
