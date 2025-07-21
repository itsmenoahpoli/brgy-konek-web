import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      >
        <div class="mt-3 text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
          >
            <svg
              class="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
            {{ title }}
          </h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class SuccessModalComponent implements OnInit, OnDestroy {
  @Input() set isVisible(value: boolean) {
    console.log('SuccessModal isVisible changed to:', value);
    this._isVisible = value;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  private _isVisible = false;
  @Input() title = 'Success!';
  @Input() message = 'Operation completed successfully.';
  @Input() autoCloseDelay = 2000;
  @Output() modalClosed = new EventEmitter<void>();

  private timeoutId?: number;

  ngOnInit(): void {
    console.log('SuccessModal ngOnInit - isVisible:', this.isVisible);
    if (this.isVisible && this.autoCloseDelay > 0) {
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

  private closeModal(): void {
    console.log('SuccessModal closeModal called');
    this._isVisible = false;
    this.modalClosed.emit();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
