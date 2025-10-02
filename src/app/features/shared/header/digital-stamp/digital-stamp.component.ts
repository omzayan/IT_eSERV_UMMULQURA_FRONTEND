import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  SaudiFlagIconComponent,
  DropdownArrowIconComponent,
} from '../icons/header-icons.component';

@Component({
  selector: 'app-digital-stamp',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SaudiFlagIconComponent,
    DropdownArrowIconComponent,
  ],
  template: `
    <div
      class="flex h-6 sm:h-8 px-4 sm:px-6 lg:px-8 items-center gap-1.5 sm:gap-2.5 bg-gray-100"
    >
      <div class="flex items-center gap-1.5 sm:gap-2.5">
        <div
          class="flex w-4 h-3 sm:w-5 sm:h-3.5 justify-center items-center bg-white"
        >
          <app-saudi-flag-icon></app-saudi-flag-icon>
        </div>
        <span
          class="text-gray-900 text-xs sm:text-sm font-medium font-ibm-plex-arabic"
        >
          {{ 'stamp.govSite' | translate }}
        </span>
        <div class="hidden sm:flex px-0 items-center gap-1">
          <span
            class="text-green-700 text-xs sm:text-sm font-normal font-ibm-plex-arabic"
          >
            {{ 'stamp.howToVerify' | translate }}
          </span>
          <app-dropdown-arrow-icon
            class="w-3 h-3 sm:w-4 sm:h-4"
          ></app-dropdown-arrow-icon>
        </div>
      </div>
    </div>
  `,
})
export class DigitalStampComponent {}
