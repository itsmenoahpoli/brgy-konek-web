export interface Announcement {
  id: string;
  banner_image: string;
  title: string;
  header: string;
  body: string;
  status: string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>('/announcements');
  }

  addAnnouncement(announcement: Announcement): Observable<any> {
    return this.http.post('/announcements', announcement);
  }

  updateAnnouncement(id: string, announcement: Announcement): Observable<any> {
    return this.http.put(`/announcements/${id}`, announcement);
  }

  deleteAnnouncement(id: string): Observable<any> {
    return this.http.delete(`/announcements/${id}`);
  }
}
