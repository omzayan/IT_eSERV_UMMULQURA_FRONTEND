import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { PrayTimeSectionComponent } from '../../components/pray-time-section/pray-time-section.component';
import { QiblaCompassComponent } from '../../components/qibla-compass/qibla-compass.component';
import { WebServicesComponent } from '../../components/web-services/web-services.component';
import { PartnersComponent } from '../../components/partners/partners.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    PrayTimeSectionComponent,
    QiblaCompassComponent,
    WebServicesComponent,
    PartnersComponent,
  ],
  template: `
    <div class="home-page">
      <app-hero-section></app-hero-section>
      <app-pray-time-section></app-pray-time-section>
      <!-- <app-prayer-times-table></app-prayer-times-table> -->
      <app-qibla-compass id="qibla-compass-section"></app-qibla-compass>
      <app-web-services></app-web-services>
      <app-partners></app-partners>
    </div>
  `,
  styles: [
    `
      .home-page {
        width: 100%;
      }
    `,
  ],
})
export class HomeComponent {
  constructor() {}
}
