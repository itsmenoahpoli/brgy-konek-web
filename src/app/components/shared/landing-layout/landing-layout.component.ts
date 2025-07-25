import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-layout',
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.scss'],
  standalone: true,
})
export class LandingLayoutComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  goContact() {
    this.router.navigate(['/contact']);
  }

  goServices() {
    this.router.navigate(['/services']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
