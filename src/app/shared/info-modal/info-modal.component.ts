import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './info-modal.component.html',
  styles: [],
})
export class InfoModalComponent {
  @Input() set isVisible(value: boolean) {
    this._isVisible = value;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  private _isVisible = false;
  @Input() title = 'Information';
  @Input() message = 'Information message.';
  @Input() buttonText = 'OK';
  @Output() modalClosed = new EventEmitter<void>();
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  closeModal(): void {
    this._isVisible = false;
    this.modalClosed.emit();
  }
}
