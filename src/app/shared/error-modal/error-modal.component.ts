import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './error-modal.component.html',
  styles: [],
})
export class ErrorModalComponent {
  @Input() set isVisible(value: boolean) {
    this._isVisible = value;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  private _isVisible = false;
  @Input() title = 'Error';
  @Input() message = 'An error occurred.';
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
