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
  ],
  template: `
    <div
      class="digital-stamp-card w-full bg-[#F3F4F6] border border-gray-100 transition-all duration-300"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Header -->
        <div
          class="digital-stamp-header flex justify-start items-center cursor-pointer select-none"
          (click)="toggleOpen()"
        >
          <!-- Left side: Flag + Text -->
          <div class="flex items-center gap-2">
            <img
              src="assets/images/CountryFlags.svg"
              alt="Saudi Arabia Flag"
              class="w-6 h-auto"
            />
            <h6 class="text-gray-900 text-sm sm:text-base font-medium">
              {{ 'digitalStamp.officialGovernmentSite' | translate }}
            </h6>
          </div>

          <!-- Right side: Button -->
          <div
            class="btn-digital-stamp-card flex items-center gap-1 text-green-700 text-sm sm:text-base font-medium"
          >
            <span class="ms-2">{{ 'digitalStamp.howToVerify' | translate }}</span>
            <img
              src="assets/images/arrow-down-green.svg"
              alt="Arrow Down"
              class="arrow-icon w-4 h-4 transform transition-transform duration-300"
              [ngClass]="{ 'rotate-180': isOpen }"
            />
          </div>
        </div>

        <!-- Body -->
        <div
          class="digital-stamp-body overflow-hidden transition-all duration-500 ease-in-out "
          [ngClass]="{
            'max-h-[1000px] py-4 pt-6 opacity-100': isOpen,
            'max-h-0 py-0 opacity-0': !isOpen
          }"
        >
          <div
            class="digital-stamp-container flex flex-col md:flex-row gap-5 md:gap-8 justify-between"
          >
            <!-- Box 1 -->
            <div class="box flex items-start gap-3">
              <img
                src="assets/images/link-icon.svg"
                alt="Link Icon"
                class="w-6 h-6 flex-shrink-0"
              />
              <div>
                <h6 class="text-gray-900 text-sm font-medium leading-snug">
                  {{ 'digitalStamp.box1Title' | translate }}
                  <span class="text-green-700 font-semibold">{{ 'digitalStamp.govSa' | translate }}</span>
                </h6>
                <p class="text-gray-600 text-xs leading-relaxed mt-1">
                  {{ 'digitalStamp.box1Desc' | translate }}
                </p>
              </div>
            </div>

            <!-- Box 2 -->
            <div class="box flex items-start gap-3">
              <img
                src="assets/images/square-lock-password.svg"
                alt="Password Icon"
                class="w-6 h-6 flex-shrink-0"
              />
              <div>
                <h6 class="text-gray-900 text-sm font-medium leading-snug">
                  {{ 'digitalStamp.box2Title1' | translate }}
                  <span class="text-green-700 font-semibold">{{ 'digitalStamp.https' | translate }}</span>
                  {{ 'digitalStamp.box2Title2' | translate }}
                </h6>
                <p class="text-gray-600 text-xs leading-relaxed mt-1">
                  {{ 'digitalStamp.box2Desc' | translate }}
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="stamp-link-box flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700"
          >
            <img
              src="assets/images/DGA-logo-icon.svg"
              alt="DGA Logo"
              class="w-6 h-6"
            />
            <p class="m-0">{{ 'digitalStamp.registeredAtDGA' | translate }}</p>
            <a
              href="https://raqmi.dga.gov.sa/platforms/DigitalStamp/ShowCertificate/4990"
              target="_blank"
              class="text-green-700 underline hover:text-green-800"
            >
              20240520402
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DigitalStampComponent {
  isOpen = false;

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
