import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-pray-time-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="w-full h-[315px] bg-cover bg-center bg-no-repeat relative py-6 px-[61px]"
      [style.background-image]="getBackgroundImage()"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <div class="flex justify-between items-center h-full">
        <div class="flex flex-col gap-[50px]">
          <div class="flex flex-col gap-6">
            <span
              class="text-white text-[60px] font-bold leading-tight font-ibm-plex-arabic"
              [class]="isAr ? 'text-right' : 'text-left'"
            >
              {{ 'prayTimeHero.title' | translate }}
            </span>
            <span
              class="text-white text-[20px] leading-relaxed font-ibm-plex-arabic"
              [class]="isAr ? 'text-right' : 'text-left'"
            >
              {{ 'prayTimeHero.description' | translate }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pray-time-hero {
        width: 100%;
        height: 315px;
        background-attachment: fixed;
      }

      @media (max-width: 768px) {
        .pray-time-hero {
          background-attachment: scroll;
        }
      }
    `,
  ],
})
export class PrayTimeHeroComponent implements OnInit, OnDestroy {
  isAr = false;
  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Subscribe to language changes using the language service
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBackgroundImage(): string {
    const direction = this.isAr ? 'right' : 'left';
    return `linear-gradient(to ${direction}, transparent 0%, #092A1E 90%), url("assets/images/Mecca.png")`;
  }
}
