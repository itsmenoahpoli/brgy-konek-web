import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusModalType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-modal.component.html',
  styleUrl: './status-modal.component.scss',
})
export class StatusModalComponent implements OnInit, OnDestroy {
  @Input() set isVisible(value: boolean) {
    this._isVisible = value;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  private _isVisible = false;
  @Input() type: StatusModalType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() buttonText = 'OK';
  @Input() autoCloseDelay = 2000;
  @Output() modalClosed = new EventEmitter<void>();
  private timeoutId?: number;
  ngOnInit(): void {
    if (this.isVisible && this.type === 'success' && this.autoCloseDelay > 0) {
      this.startAutoCloseTimer();
    }
  }
  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  private startAutoCloseTimer(): void {
    this.timeoutId = window.setTimeout(() => {
      this.closeModal();
    }, this.autoCloseDelay);
  }
  closeModal(): void {
    this._isVisible = false;
    this.modalClosed.emit();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
