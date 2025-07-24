import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UsersService, User } from '../../../services/users.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, DatePipe],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  users: User[] = [];
  currentUserId: string | undefined;
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}
  async ngOnInit(): Promise<void> {
    this.users = (await this.usersService.getUsers()) || [];
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id;
  }
  editUser(user: User) {}
  deleteUser(user: User) {}
  openCreateUserModal() {}
}
