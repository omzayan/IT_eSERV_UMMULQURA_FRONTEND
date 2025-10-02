import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Partner {
  id: number;
  name: string;
  logo: string;
  nameAr: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="p-4 md:pb-[80px] md:px-[80px] flex flex-col gap-3 overflow-hidden"
    >
      <div class="flex gap-3 w-full">
        <div class="flex flex-col gap-3">
          <!-- Title -->
          <div class="flex gap-4 w-full">
            <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
              {{ 'partners.title' | translate }}
            </h2>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="flex partners-animate-scroll">
          <!-- First set of partners -->
          <div *ngFor="let partner of partners" class="flex-shrink-0 mx-8">
            <div
              class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32 flex items-center justify-center border border-gray-100"
            >
              <img
                [src]="partner.logo"
                [alt]="partner.name"
                class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>

          <!-- Second set of partners for infinite scroll effect -->
          <div *ngFor="let partner of partners" class="flex-shrink-0 mx-8">
            <div
              class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32 flex items-center justify-center border border-gray-100"
            >
              <img
                [src]="partner.logo"
                [alt]="partner.name"
                class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes partners-scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      .partners-animate-scroll {
        animation: partners-scroll 30s linear infinite;
      }

      .partners-animate-scroll:hover {
        animation-play-state: paused;
      }
    `,
  ],
})
export class PartnersComponent {
  partners: Partner[] = [
    {
      id: 1,
      name: 'National Center for Digital Government',
      nameAr: 'المركز الوطني للحكومة الرقمية',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 2,
      name: 'Ministry of Media',
      nameAr: 'وزارة الإعلام',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 3,
      name: 'Ministry of Finance',
      nameAr: 'وزارة المالية',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 4,
      name: 'Ministry of Culture',
      nameAr: 'وزارة الثقافة',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 5,
      name: 'Saudi Public Investment Fund',
      nameAr: 'صندوق الاستثمارات العامة',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 6,
      name: 'National Center for Digital Government',
      nameAr: 'المركز الوطني للحكومة الرقمية',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 7,
      name: 'Ministry of Media',
      nameAr: 'وزارة الإعلام',
      logo: 'assets/images/FIN.png',
    },
    {
      id: 8,
      name: 'Ministry of Finance',
      nameAr: 'وزارة المالية',
      logo: 'assets/images/FIN.png',
    },
  ];

  constructor() {}
}
