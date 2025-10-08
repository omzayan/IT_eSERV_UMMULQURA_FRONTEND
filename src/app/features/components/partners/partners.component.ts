import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core';
import { environment } from '../../../../environments/environment';

interface Partner {
  id: number;
  title: string;
  link?: string;
  imageId?: number;
  imageUrl: string;
  displayOrder: number;
  showOnWebsite?: boolean;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-4 md:pb-[80px] md:px-[80px] flex flex-col gap-3 overflow-hidden">
      <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
        {{ 'partners.title' | translate }}
      </h2>

      <div class="relative">
        <div class="flex partners-animate-scroll">
          <ng-container *ngFor="let partner of partners">
            <div class="flex-shrink-0 mx-8">
              <div
                class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32 flex items-center justify-center border border-gray-100"
              >
                <img
                  [src]="partner.imageUrl"
                  [alt]="partner.title"
                  class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </ng-container>

          <!-- duplicate for infinite scroll -->
          <ng-container *ngFor="let partner of partners">
            <div class="flex-shrink-0 mx-8">
              <div
                class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32 flex items-center justify-center border border-gray-100"
              >
                <img
                  [src]="partner.imageUrl"
                  [alt]="partner.title"
                  class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes partners-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
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
export class PartnersComponent implements OnInit, OnDestroy {
  partners: Partner[] = [];
  private apiSub?: Subscription;
  baseUrl = environment.apiBaseUrl;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiSub = this.apiService.getPartners().subscribe({
      next: (res: any) => {
        if (res && res.result) {
          this.partners = res.result
            .filter((p: any) => p.showOnWebsite)
            .map((p: any) => ({
              id: p.id,
              title: p.title,
              link: p.link,
              displayOrder: p.displayOrder,
              showOnWebsite: p.showOnWebsite,
              imageUrl: p.image ? `${this.baseUrl}${p.image.fileName}` : 'assets/images/default.png',
            }))
            .sort((a: Partner, b: Partner) => a.displayOrder - b.displayOrder);
        }
      },
      
    });
  }

  ngOnDestroy(): void {
    this.apiSub?.unsubscribe();
  }
}
