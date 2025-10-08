import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';
import { PrayerTimesResult, MonthPrayerTimes, PrayerTime } from '../../../core/types/api.types';

interface CalendarMonth {
  month: number; // 1..12 (gregorian month)
  hijri_month_name: string;
  gregorian_month_name: string;
  days: PrayerTime[]; // length = days in that gregorian month (placeholders if API missing)
}

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
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span class="font-['IBM_Plex_Sans_Arabic']">{{ 'BACK' | translate }}</span>
          </button>

          <h1 class="text-2xl md:text-3xl font-bold text-[#161616] font-['IBM_Plex_Sans_Arabic']">
            {{ 'GREGORIAN_CALENDAR' | translate }} {{ selectedYear }}م
          </h1>

          <div class="w-16"></div>
        </div>

        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B8354]"></div>
          <span class="ml-3 text-[#161616] font-['IBM_Plex_Sans_Arabic']">{{ 'LOADING_CALENDAR' | translate }}...</span>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div *ngIf="!isLoading && calendarData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let month of calendarData" class="bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden">
          <!-- Month Header -->
          <div class="bg-[#1B8354] text-white p-4 text-center">
            <h3 class="text-lg font-semibold font-['IBM_Plex_Sans_Arabic']">{{ month.gregorian_month_name }}</h3>
            <p class="text-sm opacity-90 font-['IBM_Plex_Sans_Arabic']">{{ month.hijri_month_name }}</p>
          </div>

          <!-- Days Header -->
          <div class="grid grid-cols-7 bg-[#F8F9FA] border-b border-[#E5E7EB]">
            <div *ngFor="let day of dayHeaders" class="p-2 text-center text-xs font-medium text-[#6B7280] border-r border-[#E5E7EB] last:border-r-0 font-['IBM_Plex_Sans_Arabic']">
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
        <div class="text-[#DC2626] text-lg font-['IBM_Plex_Sans_Arabic'] mb-4">{{ 'ERROR_LOADING_CALENDAR' | translate }}</div>
        <button (click)="loadCalendar()" class="bg-[#1B8354] text-white px-6 py-2 rounded-lg hover:bg-[#0F5132] transition-colors font-['IBM_Plex_Sans_Arabic']">
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

  selectedYear: number = new Date().getFullYear();
  calendarData: CalendarMonth[] | null = null;
  isLoading = false;
  isRtl = false;

  // Saturday-first headers (Arabic shown — غيّريها لو تحبي إنجليزية)
  dayHeaders: string[] = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

  // أسماء الشهور الميلادية (عربي وأنجليزي)
  private gregorianMonthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  private gregorianMonthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  private gregorianMonthNames: string[] = this.gregorianMonthNamesEn;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // read year from query param
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['year']) {
        this.selectedYear = parseInt(params['year'], 10);
      }
      this.loadCalendar();
    });

    // set language / month names (assumes languageService emits 'ar' for Arabic)
    this.languageService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe((lang) => {
      this.isRtl = lang === 'ar';
      this.gregorianMonthNames = this.isRtl ? this.gregorianMonthNamesAr : this.gregorianMonthNamesEn;
      // update day headers in Arabic if desired (kept static above)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private daysInMonth(year: number, month: number): number {
    // month: 1..12
    return new Date(year, month, 0).getDate();
  }

  loadCalendar(): void {
    this.isLoading = true;
    this.calendarData = null;

    // Step 1: convert Gregorian (Jan 1 of selectedYear) -> Hijri year so API accepts
    this.apiService.convertGregorianToHijri({ year: this.selectedYear, month: 1, day: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (convRes) => {
          if (!convRes || !convRes.success || !convRes.result) {
            console.error('Conversion failed or invalid response', convRes);
            this.isLoading = false;
            return;
          }

          const hijriYear = convRes.result.year;

          // Step 2: request the Hijri-year calendar (API returns months grouped by Hijri months)
          this.apiService.getCalendar(hijriYear).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
              if (!response || !response.success || !response.result) {
                console.error('Failed to get calendar', response);
                this.calendarData = null;
                this.isLoading = false;
                return;
              }

              const result: PrayerTimesResult = response.result;

              // flatten all prayerTimes across hijri-month groups
              const allPrayerTimes: PrayerTime[] = (result.months || [])
                .flatMap((m: MonthPrayerTimes) => m.prayerTimes || []);

              // Build 12 Gregorian months (Jan..Dec) for selectedYear,
              // for each day try to find matching prayerData (by gregorian_date)
              const mappedMonths: CalendarMonth[] = [];
              for (let gMonth = 1; gMonth <= 12; gMonth++) {
                const daysCount = this.daysInMonth(this.selectedYear, gMonth);
                const daysArr: PrayerTime[] = [];

                for (let d = 1; d <= daysCount; d++) {
                  const found = allPrayerTimes.find(pt =>
                    pt.gregorian_date &&
                    pt.gregorian_date.year === this.selectedYear &&
                    pt.gregorian_date.month === gMonth &&
                    pt.gregorian_date.day === d
                  );

                  if (found) {
                    daysArr.push(found);
                  } else {
                    // placeholder PrayerTime (keeps UI stable; replace strings as you like)
                    const placeholder: PrayerTime = {
                      fajr: '--',
                      sunrise: '--',
                      dhuhr: '--',
                      asr: '--',
                      maghrib: '--',
                      isha: '--',
                      sunset: '--',
                      hijri_date: {
                        day: 0,
                        month: 0,
                        year: 0,
                        month_name: '',
                        day_name: '',
                        formatted: '',
                        iso: ''
                      },
                      gregorian_date: {
                        day: d,
                        month: gMonth,
                        year: this.selectedYear,
                        month_name: this.gregorianMonthNames[gMonth - 1] || '',
                        day_name: '',
                        formatted: '',
                        iso: ''
                      },
                      // farmer_date? optional, ignore if not present in interface
                    } as unknown as PrayerTime;

                    daysArr.push(placeholder);
                  }
                }

                // pick a representative hijri month name for header (first non-placeholder day)
                const firstWithHijri = daysArr.find(x => x.hijri_date && x.hijri_date.month_name);
                const hijriMonthName = firstWithHijri?.hijri_date?.month_name || '';

                mappedMonths.push({
                  month: gMonth,
                  gregorian_month_name: this.gregorianMonthNames[gMonth - 1] || '',
                  hijri_month_name: hijriMonthName,
                  days: daysArr
                });
              }

              // assign
              this.calendarData = mappedMonths;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error loading calendar from API', err);
              this.calendarData = null;
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error converting Gregorian -> Hijri', err);
          this.isLoading = false;
        }
      });
  }

  // produce grid cells for template (adds leading empty cells so 1st day aligns under correct weekday)
  getMonthCalendarDays(month: CalendarMonth): any[] {
    if (!month.days || month.days.length === 0) return [];

    const days: any[] = [];

    // first day of that gregorian month (for grid alignment)
    const firstDate = new Date(this.selectedYear, month.month - 1, 1);
    // Convert Date.getDay() (0=Sunday..6=Saturday) => our index with Saturday=0
    // formula: (getDay() + 1) % 7  -> Saturday(6) -> 0, Sunday(0)->1, Monday(1)->2 ...
    const firstDayOfWeek = (firstDate.getDay() + 1) % 7;

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: '', isCurrentMonth: false, isToday: false });
    }

    // then push all actual days (month.days are ordered day=1..n)
    month.days.forEach((dayData) => {
      const today = new Date();
      const isToday =
        dayData.gregorian_date &&
        dayData.gregorian_date.day === today.getDate() &&
        dayData.gregorian_date.month === (today.getMonth() + 1) &&
        dayData.gregorian_date.year === today.getFullYear();

      days.push({
        day: dayData.gregorian_date?.day ?? dayData.hijri_date?.day ?? '',
        isCurrentMonth: true,
        isToday,
        prayerData: dayData
      });
    });

    return days;
  }

  goBack(): void {
    this.router.navigate(['/calender']);
  }
}
