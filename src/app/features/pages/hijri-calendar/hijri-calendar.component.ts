import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';
import { PrayerTimesResult, MonthPrayerTimes, PrayerTime } from '../../../core/types/api.types';

interface CalendarMonth {
  month: number;
  hijri_month_name: string;
  gregorian_month_name: string;
  days: PrayerTime[];
}

@Component({
  selector: 'app-hijri-calendar',
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
            <span class="font-['IBM_Plex_Sans_Arabic']">
              {{ 'BACK' | translate }}
            </span>
          </button>

          <h1
            class="text-2xl md:text-3xl font-bold text-[#161616] font-['IBM_Plex_Sans_Arabic']"
          >
            {{ 'HIJRI_CALENDAR' | translate }} {{ selectedYear }}هـ
          </h1>

          <div class="w-16"></div>
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
          *ngFor="let month of calendarData"
          class="bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden"
        >
          <!-- Month Header -->
          <div class="bg-[#1B8354] text-white p-4 text-center">
            <h3 class="text-lg font-semibold font-['IBM_Plex_Sans_Arabic']">
              {{ month.hijri_month_name }}
            </h3>
            <p class="text-sm opacity-90 font-['IBM_Plex_Sans_Arabic']">
              {{ month.gregorian_month_name }}
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
})
export class HijriCalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selectedYear: number = 1447;
  calendarData: CalendarMonth[] | null = null; 
  isLoading = false;
  isRtl = false;
  dayHeaders: string[] = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['year']) {
        this.selectedYear = parseInt(params['year']);
      }
      this.loadCalendar();
    });

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
      .getCalendar(this.selectedYear, undefined, undefined, undefined)
      .pipe(
        map((response) => {
          if (response.success && response.result) {
            const result: PrayerTimesResult = response.result;

            const mappedMonths: CalendarMonth[] = result.months.map((m: MonthPrayerTimes) => {
              let days = [...m.prayerTimes];
              const hijriName = m.prayerTimes[0]?.hijri_date.month_name ?? '';

              // 1) اجبار ربيع الآخر يبقى 30 يوم
              if (hijriName.includes('ربيع الآخر') && days.length === 29) {
                const lastDay = days[days.length - 1];
                const extraDay = {
                  ...lastDay,
                  hijri_date: {
                    ...lastDay.hijri_date,
                    day: 30
                  }
                };
                days.push(extraDay);
              }

              // 2) اصلاح ذو الحجة (يبدأ الاثنين مش السبت)
              if (hijriName.includes('ذو الحجة')) {
                const firstDay = days[0];
                firstDay.hijri_date.day_name = 'الإثنين';
              }

              return {
                month: m.month,
                hijri_month_name: hijriName,
                gregorian_month_name: m.prayerTimes[0]?.gregorian_date.month_name ?? '',
                days: days,
              };
            });

            return mappedMonths;
          }
          throw new Error(response.error?.message || 'Failed to load calendar');
        })
      )
      .subscribe({
        next: (mapped) => {
          this.calendarData = mapped;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error mapping calendar:', err);
          this.calendarData = null;
          this.isLoading = false;
        },
      });
  }

  private dayOfWeekMap: { [key: string]: number } = {
    'Saturday': 0,
    'Sunday': 1,
    'Monday': 2,
    'Tuesday': 3,
    'Wednesday': 4,
    'Thursday': 5,
    'Friday': 6,
    'السبت': 0,
    'الأحد': 1,
    'الإثنين': 2,
    'الثلاثاء': 3,
    'الأربعاء': 4,
    'الخميس': 5,
    'الجمعة': 6,
  };

  getMonthCalendarDays(month: CalendarMonth): any[] {
    if (!month.days || month.days.length === 0) {
      return [];
    }

    const days: any[] = [];
    const firstDay = month.days[0];

    const firstDayOfWeek =
      this.dayOfWeekMap[firstDay.hijri_date.day_name] ?? 0;

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: '',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    month.days.forEach((dayData) => {
      const today = new Date();
      const isToday =
        dayData.gregorian_date.day === today.getDate() &&
        dayData.gregorian_date.month === today.getMonth() + 1 &&
        dayData.gregorian_date.year === today.getFullYear();

      days.push({
        day: dayData.hijri_date.day,
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
