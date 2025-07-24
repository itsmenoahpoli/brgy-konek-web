import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <div class="flex flex-col items-center">
          <div class="bg-red-100 rounded-full p-3 mb-4">
            <svg
              class="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-600 mb-6 text-center">{{ message }}</p>
          <div class="flex justify-center w-full gap-2">
            <button
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              (click)="cancel.emit()"
            >
              Cancel
            </button>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded"
              (click)="confirm.emit()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDeleteModalComponent {
  @Input() visible = false;
  @Input() title = 'Delete';
  @Input() message =
    'Are you sure you want to delete this item? This action cannot be undone.';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
