import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
    CallIconComponent,
    ClockIconComponent,
    UserIconComponent,
    MoneyIconComponent,
    LinkIconComponent,
    MailIconComponent,
    SmartDevicesIconComponent
} from '../../shared/icons/apis-icons.component';

@Component({
    selector: 'app-apis-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        CallIconComponent,
        ClockIconComponent,
        UserIconComponent,
        MoneyIconComponent,
        LinkIconComponent,
        MailIconComponent,
        SmartDevicesIconComponent
    ],
    template: `
    <div class="bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col gap-6 font-ibm-plex-arabic">
      <div class="flex gap-3">
        <app-user-icon></app-user-icon>
        <div>
          <div class="text-[#161616] font-bold mb-1">{{ 'apiSidebar.targetGroup' | translate }}</div>
          <div class="text-[#384250] text-sm">{{ 'apiSidebar.targetGroupDesc' | translate }}</div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <app-clock-icon></app-clock-icon>
        <div>
          <div class="text-[#161616] font-bold mb-1">{{ 'apiSidebar.serviceDuration' | translate }}</div>
          <div class="text-[#384250] text-sm">{{ 'apiSidebar.serviceDurationDesc' | translate }}</div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <app-smart-devices-icon></app-smart-devices-icon>
        <div>
          <div class="text-[#161616] font-bold mb-1">{{ 'apiSidebar.serviceChannels' | translate }}</div>
          <div class="text-[#384250] text-sm">{{ 'apiSidebar.serviceChannelsDesc' | translate }}</div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <app-money-icon></app-money-icon>
        <div>
          <div class="text-[#161616] font-bold mb-1">{{ 'apiSidebar.serviceCost' | translate }}</div>
          <div class="text-[#384250] text-sm">{{ 'apiSidebar.serviceCostDesc' | translate }}</div>
        </div>
      </div>
      
      <div class="flex  gap-3">
        <div>
          <div class="text-[#161616] font-bold mb-1">{{ 'apiSidebar.paymentChannels' | translate }}</div>
          <div class="flex gap-2 mt-2">
            <img src="assets/images/stc.png" alt="stc pay" class="h-6" />
            <img src="assets/images/mada.png" alt="mada" class="h-6" />
          </div>
        </div>
      </div>
      
      <hr class="my-2" />
      
      <div class="flex gap-3">
        <div class="flex flex-row gap-2">
          <a href="#" class="text-[#1B8354] text-sm font-medium">{{ 'apiSidebar.faqLink' | translate }}</a>
          <div class="text-[#161616] font-bold mb-1"><app-link-icon></app-link-icon></div>
        </div>
      </div>
      
      <div class="flex gap-3 row-span-2">
        <app-call-icon></app-call-icon>
        <div class="text-[#1B8354] text-sm font-medium">{{ 'apiSidebar.phone' | translate }}</div>
        <div class="text-[#161616] font-bold mb-1"><app-link-icon></app-link-icon></div>
      </div>
      
      <div class="flex gap-3">
        <app-mail-icon></app-mail-icon>
        <div class="text-[#1B8354] text-sm font-medium">{{ 'apiSidebar.email' | translate }}</div>
        <div class="text-[#161616] font-bold mb-1"><app-link-icon></app-link-icon></div>
      </div>
      
      <div class="flex  gap-3">
        <button class="bg-[#E9F7EF] text-[#1B8354] px-4 py-2 rounded text-sm font-medium">{{ 'apiSidebar.downloadGuide' | translate }}</button>
      </div>
      
      <div class="flex gap-3 mt-2">
        <div>
          <span class="text-[#161616] text-sm font-bold">{{ 'apiSidebar.mobileApps' | translate }}</span>
          <div class="flex gap-2 mt-2">
            <img src="assets/images/apple-store.png" alt="App Store" class="h-8" />
            <img src="assets/images/google-play.png" alt="Google Play" class="h-8" />
            <img src="assets/images/huawei.png" alt="AppGallery" class="h-8" />
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
    .font-ibm-plex-arabic {
      font-family: 'IBM Plex Sans Arabic', -apple-system, Roboto, Helvetica, sans-serif;
    }
  `]
})
export class ApisSidebarComponent { }
