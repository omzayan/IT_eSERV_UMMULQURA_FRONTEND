import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../features/shared/header/header.component';
import { FooterComponent } from '../../features/shared/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-full w-full">
      <div class="sticky top-0 z-50">
        <app-header></app-header>
      </div>
      <main class="flex-1 w-full">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [],
})
export class MainLayoutComponent {}
