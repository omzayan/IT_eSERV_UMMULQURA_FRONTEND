import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CheckIconComponent } from '../../shared/icons/apis-icons.component';

@Component({
    selector: 'app-prayer-time-card',
    standalone: true,
    imports: [CommonModule, TranslateModule, CheckIconComponent],
    template: `
   <div class="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col gap-3 w-full">
  <!-- Title row -->
  <div class="flex flex-col gap-2 mb-2">
    <!-- Icon -->
    <div class="flex justify-start">
      <span class="flex items-center justify-center w-7 h-7 bg-[#F7FDF9] text-[#1B8354] rounded">
        <app-check-icon></app-check-icon>
      </span>
    </div>

    <!-- Title -->
    <span class="font-bold text-[#161616] text-lg pt-1">
      {{ title }}
    </span>
  </div>

  <!-- Description -->
  <div *ngIf="description" class="text-[#384250] text-base mb-3">
    {{ description }}
  </div>

  <!-- Times + status -->
  <div class="flex flex-wrap gap-2 mb-3">
    <span
      *ngFor="let time of times"
      class="bg-[#F3F4F6] text-[#384250] px-2 py-0.5 rounded text-xs font-medium"
    >
      {{ time }}
    </span>

    <span
      class="px-2 py-0.5 rounded text-xs font-medium border"
      [ngClass]="{
        'bg-[#E9F7EF] text-[#1B8354] border-[#E5E7EB]': statusType === 'upcoming',
        'bg-[#E6F3FF] text-[#4A90E2] border-[#B3D9FF]': statusType === 'missed'
      }"
    >
      {{ statusLabel }}
    </span>
  </div>

  <!-- Actions -->
  <div class="flex gap-2 mt-2">
    <button class="bg-[#1B8354] text-white px-4 py-2 rounded text-sm font-medium">
      {{ qiblaText }}
    </button>
    <button
      class="bg-white text-[#1B8354] px-4 py-2 rounded text-sm font-medium border border-[#E5E7EB]"
    >
      {{ mosqueText }}
    </button>
  </div>
</div>

  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class PrayerTimeCardComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() times: string[] = [];
    @Input() isActive: boolean = false;
    @Input() statusLabel: string = 'قادمة';
    @Input() statusType: 'upcoming' | 'missed' = 'upcoming';
    @Input() qiblaText: string = 'اتجاه القبلة';
    @Input() mosqueText: string = 'أقرب مسجد';
}
