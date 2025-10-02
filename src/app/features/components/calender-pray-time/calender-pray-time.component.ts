import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-calender-pray-time',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="calender-pray-time bg-white p-8 rounded-lg shadow-md">
      <h3 class="text-xl font-bold mb-4">
        {{ 'calendar.tabs.prayTime' | translate }}
      </h3>
      <div class="text-center py-8">
        <div class="text-gray-600 mb-4">
          <i class="fas fa-clock text-4xl text-green-600 mb-4"></i>
        </div>
        <p class="text-gray-600">{{ 'components.comingSoon' | translate }}</p>
        <p class="text-sm text-gray-500 mt-2">
          Prayer times calendar functionality will be implemented here
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .calender-pray-time {
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class CalenderPrayTimeComponent {
  constructor() {}
}
