import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  CalendarYearResult,
  CalendarMonth,
  DailyPrayerTime,
} from '../../../core/types/api.types';

@Component({
  selector: 'app-gregorian-calendar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-[#1B8354] hover:text-[#0F5132] transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span class="font-['IBM_Plex_Sans_Arabic']">{{
              'BACK' | translate
            }}</span>
          </button>

          <h1
            class="text-2xl md:text-3xl font-bold text-[#161616] font-['IBM_Plex_Sans_Arabic']"
          >
            {{ 'GREGORIAN_CALENDAR' | translate }} {{ selectedYear }}م
          </h1>

          <div class="w-16"></div>
          <!-- Spacer for center alignment -->
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B8354]"
          ></div>
          <span class="ml-3 text-[#161616] font-['IBM_Plex_Sans_Arabic']">
            {{ 'LOADING_CALENDAR' | translate }}...
          </span>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div
        *ngIf="!isLoading && calendarData"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          *ngFor="let month of calendarData.months"
          class="bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden"
        >
          <!-- Month Header -->
          <div class="bg-[#1B8354] text-white p-4 text-center">
            <h3 class="text-lg font-semibold font-['IBM_Plex_Sans_Arabic']">
              {{ month.gregorian_month_name }}
            </h3>
            <p class="text-sm opacity-90 font-['IBM_Plex_Sans_Arabic']">
              {{ month.hijri_month_name }}
            </p>
          </div>

          <!-- Days Header -->
          <div class="grid grid-cols-7 bg-[#F8F9FA] border-b border-[#E5E7EB]">
            <div
              *ngFor="let day of dayHeaders"
              class="p-2 text-center text-xs font-medium text-[#6B7280] border-r border-[#E5E7EB] last:border-r-0 font-['IBM_Plex_Sans_Arabic']"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7">
            <div
              *ngFor="let day of getMonthCalendarDays(month)"
              class="min-h-[40px] p-1 border-r border-b border-[#E5E7EB] last:border-r-0 flex items-center justify-center text-sm font-['IBM_Plex_Sans_Arabic']"
              [class.text-[#9CA3AF]]="!day.isCurrentMonth"
              [class.text-[#161616]]="day.isCurrentMonth"
              [class.bg-[#1B8354]]="day.isToday"
              [class.text-white]="day.isToday"
              [class.font-semibold]="day.isToday"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="!isLoading && !calendarData" class="text-center py-12">
        <div class="text-[#DC2626] text-lg font-['IBM_Plex_Sans_Arabic'] mb-4">
          {{ 'ERROR_LOADING_CALENDAR' | translate }}
        </div>
        <button
          (click)="loadCalendar()"
          class="bg-[#1B8354] text-white px-6 py-2 rounded-lg hover:bg-[#0F5132] transition-colors font-['IBM_Plex_Sans_Arabic']"
        >
          {{ 'RETRY' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .rtl {
        direction: rtl;
      }
    `,
  ],
})
export class GregorianCalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selectedYear: number = 2024;
  calendarData: CalendarYearResult | null = null;
  isLoading = false;
  isRtl = false;
  dayHeaders: string[] = [
    'سبت',
    'أحد',
    'إثنين',
    'ثلاثاء',
    'أربعاء',
    'خميس',
    'جمعة',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Get year from route params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['year']) {
          this.selectedYear = parseInt(params['year']);
        }
        this.loadCalendar();
      });

    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isRtl = language === 'ar';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCalendar(): void {
    this.isLoading = true;

    this.apiService
      .getCalendar(undefined, this.selectedYear, undefined, undefined, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.calendarData = response.data;
          } else {
            console.error(
              'Failed to load Gregorian calendar:',
              response.message
            );
            this.calendarData = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading Gregorian calendar:', error);
          this.calendarData = null;
          this.isLoading = false;
        },
      });
  }

  getMonthCalendarDays(month: CalendarMonth): any[] {
    if (!month.days || month.days.length === 0) {
      return [];
    }

    const days: any[] = [];
    const firstDay = month.days[0];

    // Calculate first day of week for the month
    const firstDate = new Date(
      firstDay.gregorian_date.year,
      firstDay.gregorian_date.month - 1,
      1
    );
    let firstDayOfWeek = firstDate.getDay(); // 0 = Sunday
    firstDayOfWeek = (firstDayOfWeek + 1) % 7; // Convert to Saturday = 0

    // Add empty cells for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: '',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Add actual days
    month.days.forEach((dayData) => {
      const today = new Date();
      const isToday =
        dayData.gregorian_date.day === today.getDate() &&
        dayData.gregorian_date.month === today.getMonth() + 1 &&
        dayData.gregorian_date.year === today.getFullYear();

      days.push({
        day: dayData.gregorian_date.day,
        isCurrentMonth: true,
        isToday: isToday,
        prayerData: dayData,
      });
    });

    return days;
  }

  goBack(): void {
    this.router.navigate(['/calender']);
  }
}
