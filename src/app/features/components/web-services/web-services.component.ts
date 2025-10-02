import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ServiceCard {
  image: string;
  title: string;
  subtitle: string;
  url: string;
}

@Component({
  selector: 'app-web-services',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-4  md:p-[80px] flex flex-col gap-3">
      <div class="flex gap-3 w-full">
        <div class="flex flex-col gap-3">
          <!-- Title -->
          <div class="flex gap-4 w-full">
            <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
              {{ 'webServices.title' | translate }}
            </h2>
          </div>
          <!-- Subtitle -->
          <div class="font-ibm-plex-arabic text-base">
            {{ 'webServices.description' | translate }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          *ngFor="let service of services"
          class="bg-white p-4 border border-[#D2D6DB] rounded-2xl hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Image Section -->
          <div class="h-[250px] rounded-xl overflow-hidden mb-6">
            <img
              [src]="service.image"
              [alt]="service.title"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          <!-- Content Section -->
          <div class="flex flex-col gap-4">
            <h3 class="font-ibm-plex-arabic text-xl font-bold text-gray-800">
              {{ service.title | translate }}
            </h3>
            <p
              class="font-ibm-plex-arabic text-gray-600 text-sm leading-relaxed"
            >
              {{ service.subtitle | translate }}
            </p>

            <!-- Action Button -->
            <button
              (click)="handleServiceClick(service.url)"
              class="w-fit bg-[#1B8354] hover:bg-green-700 text-white font-ibm-plex-arabic font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ 'webServices.startService' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WebServicesComponent {
  services: ServiceCard[] = [
    {
      image: 'assets/images/service1.png',
      title: 'webServices.dateConversion.title',
      subtitle: 'webServices.dateConversion.subtitle',
      url: '#',
    },
    {
      image: 'assets/images/service2.png',
      title: 'webServices.prayerTimes.title',
      subtitle: 'webServices.prayerTimes.subtitle',
      url: '#',
    },
  ];

  constructor(private translate: TranslateService) {}

  handleServiceClick(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
