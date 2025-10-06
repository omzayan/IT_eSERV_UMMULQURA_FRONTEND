import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PrayTimeHeroComponent } from '../../components/pray-time-hero/pray-time-hero.component';
import { PrayTimeImageComponent } from '../../components/pray-time-image/pray-time-image.component';
import { PrayTimeTabsComponent } from '../../components/pray-time-tabs/pray-time-tabs.component';
import { PrayTimeSectionComponent } from "../../components/pray-time-section/pray-time-section.component";

@Component({
  selector: 'app-pray-time',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PrayTimeHeroComponent,
    PrayTimeImageComponent,
    PrayTimeTabsComponent,
    PrayTimeSectionComponent
],
  template: `
    <div class="">
      <!-- Prayer Time Hero Section -->
      <app-pray-time-hero></app-pray-time-hero>

      <!-- Prayer Time Image Section with Dynamic Content -->
      <app-pray-time-image></app-pray-time-image>

      <app-pray-time-section></app-pray-time-section>

      <!-- Prayer Time Tabs and Table Section -->
      <app-pray-time-tabs></app-pray-time-tabs>
    </div>
  `,
})
export class PrayTimeComponent {
  constructor() {}
}
