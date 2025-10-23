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
  imageId: number;
  displayOrder: number;
  showInWebsite: boolean;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="w-full h-[550px] relative overflow-hidden">
      <!-- Slides Container -->
      <div class="relative w-full h-full">
        <div
          class="flex  transition-transform duration-500 ease-in-out h-full"
        >
          <div
            *ngFor="let slide of slides; let i = index"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        [ngStyle]="{ opacity: currentSlide === i ? 1 : 0 }"
      >
        <img [src]="slide.imageUrl" alt="{{ slide.title }}" class="absolute inset-0 w-full h-full object-cover" />
            
        <div class="absolute inset-0 "></div>
            <div class="relative flex flex-col gap-[50px] justify-center h-full z-10 px-[61px] container mx-auto">
              <!-- Title & Description -->
          <div class="flex flex-col gap-6 w-full lg:w-1/2 max-w-[50rem]">
  <span class="text-white text-[40px] sm:text-[50px] lg:text-[60px] font-bold leading-tight font-ibm-plex-arabic">
    {{ slide.title }}
  </span>
  <span class="text-white text-[16px] sm:text-[18px] lg:text-[20px] leading-relaxed font-ibm-plex-arabic">
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
  currentLanguage = 'ar';
  private autoPlaySubscription?: Subscription;
  private destroy$ = new Subject<void>();

  slides: SlideContent[] = [];
  baseUrl = environment.apiBaseUrl;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {

    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.currentLanguage = language;
        this.updateSlidesByLanguage(language);
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
    const cached = JSON.parse(localStorage.getItem('banners') || 'null');
    const oneDay = 24 * 60 * 60 * 1000;
    if (cached && (Date.now() - cached.timestamp < oneDay)) {
      this.slides = cached.data;
      this.updateSlidesByLanguage(this.currentLanguage);
      return;
    }

    this.apiService.getBanners().subscribe({
      next: async (res) => {
        if (res && res.result) {
          this.slides = res.result
          .filter((p: any) => p.showInWebsite)
          .map((b: any) => ({
            id: b.id,
            imageId: b.image?.id,
            imageUrl: b.image?.imageUrl ? `https://localhost:44311${b.image.imageUrl}` : 'assets/images/placeholder.png',
            displayOrder: b.displayOrder,
            showInWebsite: b.showInWebsite,
            ...b,
          }));

          await Promise.all(this.slides.map(async (slide, idx) => {
            if (!slide.imageId) return;
            try {
              const dto: any = await this.apiService.getBannerAttachment(slide.imageId).toPromise();
              const att = dto?.result ?? dto ?? {};
              if (att.bytes) {
                const mime = this.detectMimeFromName(att.fileName ?? att.fileExt);
                slide.imageUrl = `data:${mime};base64,${att.bytes}`;
              }
            } catch { }
          }));

          localStorage.setItem('banners', JSON.stringify({ data: this.slides, timestamp: Date.now() }));
          this.updateSlidesByLanguage(this.currentLanguage);

        }
      },
      error: (err) => console.error('Error loading banners', err),
    });
  }

  private getTitleByLanguage(item: any, lang: string): string {
    const langKeyMap: Record<string, string[]> = {
      ar: ['ArabicTitle', 'arabicTitle'],
      en: ['EnglishTitle', 'englishTitle'],
      fr: ['FrenchTitle', 'frenchTitle'],
      ch: ['ChineseTitle', 'chineseTitle'],
      Ad: ['UrduTitle', 'urduTitle'],
      IN: ['IndonesianTitle', 'indonesianTitle'],
      BN: ['BengaliTitle', 'bengaliTitle'],
      Tu: ['TurkishTitle', 'turkishTitle'],
    };

    const keys = langKeyMap[lang] || ['ArabicTitle', 'arabicTitle'];
    for (const key of keys) {
      if (item[key] && item[key].trim() !== '') return item[key];
    }
    return item['ArabicTitle'] || item['arabicTitle'] || 'No Title';
  }

  private getDescriptionByLanguage(item: any, lang: string): string {
    const langKeyMap: Record<string, string[]> = {
      ar: ['ArabicDescription', 'arabicDescription'],
      en: ['EnglishDescription', 'englishDescription'],
      fr: ['FrenchDescription', 'frenchDescription'],
      ch: ['ChineseDescription', 'chineseDescription'],
      Ad: ['UrduDescription', 'urduDescription'],
      IN: ['IndonesianDescription', 'indonesianDescription'],
      BN: ['BengaliDescription', 'bengaliDescription'],
      Tu: ['TurkishDescription', 'turkishDescription'],
    };

    const keys = langKeyMap[lang] || ['ArabicDescription', 'arabicDescription'];
    for (const key of keys) {
      if (item[key] && item[key].trim() !== '') return item[key];
    }
    return item['ArabicDescription'] || item['arabicDescription'] || '';
  }

  private updateSlidesByLanguage(lang: string): void {
    if (!this.slides || this.slides.length === 0) return;

    this.slides.forEach((slide) => {
      slide.title = this.getTitleByLanguage(slide, lang);
      slide.description = this.getDescriptionByLanguage(slide, lang);
    });
  }

  private detectMimeFromName(nameOrExt?: string): string {
    const ext = ((nameOrExt || '').includes('.')
      ? nameOrExt!.slice(nameOrExt!.lastIndexOf('.'))
      : nameOrExt || ''
    ).toLowerCase();

    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.gif': return 'image/gif';
      default: return 'image/jpeg';
    }
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
