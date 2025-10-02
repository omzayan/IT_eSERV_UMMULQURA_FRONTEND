import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, Subscription, Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

interface CarouselResponsive {
  desktop: { breakpoint: { max: number; min: number }; items: number };
  tablet: { breakpoint: { max: number; min: number }; items: number };
  mobile: { breakpoint: { max: number; min: number }; items: number };
}

interface SlideContent {
  id: number;
  title: string;
  description: string;
  download: string;
  backgroundImage: string;
  gradientDirection: string;
  textAlignment: string;
  imagePosition: string;
  images: string[];
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
            class="w-full h-[490px] bg-cover bg-center bg-no-repeat relative py-6 px-[61px] flex-shrink-0"
            [style.background-image]="slide.backgroundImage"
            [style.direction]="isAr ? 'rtl' : 'ltr'"
          >
            <div class="flex justify-between items-center h-full">
              <!-- Text Content -->
              <div
                class="flex flex-col gap-[50px]"
                [class]="getContentAlignment(slide, isAr)"
              >
                <div
                  class="flex flex-col gap-6"
                  [class]="getTextAlignment(slide, isAr)"
                >
                  <span
                    class="text-white text-[60px] font-bold leading-tight font-ibm-plex-arabic"
                  >
                    {{ slide.title | translate }}
                  </span>
                  <span
                    class="text-white text-[20px] leading-relaxed font-ibm-plex-arabic"
                  >
                    {{ slide.description | translate }}
                  </span>
                </div>
                <div class="flex flex-col gap-3">
                  <span
                    class="text-white text-[20px] font-ibm-plex-arabic"
                    [class]="getTextAlignment(slide, isAr)"
                  >
                    {{ slide.download | translate }}
                  </span>
                  <div class="flex gap-3">
                    <img
                      src="assets/images/apple-store.png"
                      alt="apple store"
                      class="w-[120px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <img
                      src="assets/images/google-play.png"
                      alt="google play"
                      class="w-[120px] h-[48px] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                </div>
              </div>

              <!-- Images -->
              <div class="flex gap-2" [class]="getImagePosition(slide)">
                <img
                  *ngFor="let image of slide.images"
                  [src]="image"
                  [alt]="'hero image ' + (i + 1)"
                  class="w-[400px] h-[400px] rounded-[20px] shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots Indicators -->
      <div
        class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2"
      >
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
  styles: [
    `
      .hero-section {
        width: 100%;
        height: 490px;
      }
    `,
  ],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  isAr = false;
  private autoPlaySubscription?: Subscription;
  private destroy$ = new Subject<void>();

  slides: SlideContent[] = [
    {
      id: 1,
      title: 'hero.title',
      description: 'hero.description',
      download: 'hero.download',
      backgroundImage: `linear-gradient(to right, transparent 0%, #092A1E 49%), url("assets/images/city.jpg")`,
      gradientDirection: 'to right',
      textAlignment: 'left',
      imagePosition: 'right',
      images: ['assets/images/mock-up-2.png', 'assets/images/mock-up-1.png'],
    },
    {
      id: 2,
      title: 'hero.slide2.title',
      description: 'hero.slide2.description',
      download: 'hero.slide2.download',
      backgroundImage: `linear-gradient(to left, transparent 0%, #1a4b3a 49%), url("assets/images/city.jpg")`,
      gradientDirection: 'to left',
      textAlignment: 'right',
      imagePosition: 'left',
      images: ['assets/images/mock-up-1.png', 'assets/images/mock-up-2.png'],
    },
  ];

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes using the language service
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
      });

    // Start auto-play
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoPlay();
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

  getContentAlignment(slide: SlideContent, isAr: boolean): string {
    if (slide.id === 1) {
      return isAr ? 'items-end' : 'items-start';
    } else {
      return isAr ? 'items-start' : 'items-end';
    }
  }

  getTextAlignment(slide: SlideContent, isAr: boolean): string {
    if (slide.id === 1) {
      return isAr ? 'text-right' : 'text-left';
    } else {
      return isAr ? 'text-left' : 'text-right';
    }
  }

  getImagePosition(slide: SlideContent): string {
    return slide.imagePosition === 'left' ? 'order-first' : 'order-last';
  }
}
