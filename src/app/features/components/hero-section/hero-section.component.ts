import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, Subscription, Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { ApiService } from '../../../core';
import { environment } from '../../../../environments/environment';

interface SlideContent {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  showInWebsite: boolean;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="w-full h-[490px] relative overflow-hidden">
      <!-- Slides Container -->
      <div class="relative w-full h-full">
        <div
          class="flex transition-transform duration-500 ease-in-out h-full"
          [style.transform]="'translateX(-' + currentSlide * 100 + '%)'"
        >
          <div
            *ngFor="let slide of slides; let i = index"
            class="min-w-full h-[490px] bg-cover bg-center bg-no-repeat relative py-6 px-[61px] flex-shrink-0"
            [ngStyle]="{'background-image': 'url(' + slide.imageUrl + ')'}"
            [style.direction]="isAr ? 'rtl' : 'ltr'"
          >
            <!-- overlay عشان النص يبان -->
            <div class="absolute inset-0 bg-black/40"></div>

            <div class="relative flex flex-col gap-[50px] justify-center h-full z-10">
              <!-- Title & Description -->
              <div class="flex flex-col gap-6">
                <span class="text-white text-[60px] font-bold leading-tight font-ibm-plex-arabic">
                  {{ slide.title }}
                </span>
                <span class="text-white text-[20px] leading-relaxed font-ibm-plex-arabic">
                  {{ slide.description }}
                </span>
              </div>

              <!-- Download Section -->
              <div class="flex flex-col gap-3 mt-6">
             
             <div class="flex gap-3">
               <img src="assets/images/apple-store.png" alt="apple store" 
               class="w-[120px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity" /> 
               <img src="assets/images/google-play.png" alt="google play"
                class="w-[120px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity" /> </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots Indicators -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        <button
          *ngFor="let slide of slides; let i = index"
          (click)="goToSlide(i)"
          class="w-3 h-3 rounded-full transition-colors duration-300"
          [class]="currentSlide === i ? 'bg-white' : 'bg-white/50'"
          [attr.aria-label]="'Go to slide ' + (i + 1)"
        ></button>
      </div>
    </div>
  `,
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  isAr = false;
  private autoPlaySubscription?: Subscription;
  private destroy$ = new Subject<void>();

  slides: SlideContent[] = [];
  baseUrl = environment.apiBaseUrl;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
   
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
      });

    this.fetchBanners();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoPlay();
  }

 fetchBanners(): void {


  this.apiService.getBanners().subscribe({
    next: (res) => {
     
       
      if (res && res.result) {
        this.slides = res.result.map((b: any) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          imageUrl: b.image?.imageUrl ? `https://localhost:44311${b.image.imageUrl}` : 'assets/images/placeholder.png',
          displayOrder: b.displayOrder,
          showInWebsite: b.showInWebsite,
        }));
 
       
      }
    },
    error: (err) => console.error('Error loading banners', err),
  });
}


  startAutoPlay(): void {
    this.autoPlaySubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  stopAutoPlay(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}
