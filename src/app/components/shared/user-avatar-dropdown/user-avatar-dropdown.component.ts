import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-user-avatar-dropdown',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './user-avatar-dropdown.component.html',
  styles: [],
})
export class UserAvatarDropdownComponent {
  dropdownOpen = false;
  @Output() logout = new EventEmitter<void>();
  @Output() myAccount = new EventEmitter<void>();
  @Output() updatePassword = new EventEmitter<void>();
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  closeDropdown() {
    this.dropdownOpen = false;
  }
  onLogout(event: Event) {
    event.stopPropagation();
    this.logout.emit();
    this.closeDropdown();
  }
  onMyAccount(event: Event) {
    event.stopPropagation();
    this.myAccount.emit();
    this.closeDropdown();
  }
  onUpdatePassword(event: Event) {
    event.stopPropagation();
    this.updatePassword.emit();
    this.closeDropdown();
  }
}
