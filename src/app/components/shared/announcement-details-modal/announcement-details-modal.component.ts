import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Announcement } from '../../../services/announcements.service';

@Component({
  selector: 'app-announcement-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-details-modal.component.html',
  styleUrl: './announcement-details-modal.component.scss',
})
export class AnnouncementDetailsModalComponent {
  @Input() isVisible = false;
  @Input() announcement: Announcement | null = null;
  @Output() modalClosed = new EventEmitter<void>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.isVisible = false;
    this.modalClosed.emit();
  }
}
