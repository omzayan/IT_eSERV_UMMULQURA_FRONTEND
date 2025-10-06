import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { ApiService } from '../../../core/services/api.service';
import {
  MonthResult,
  MonthlyPrayerTimesResult,
  DailyPrayerTime,
  WeekDayResult,
  MonthPrayerTimes,
} from '../../../core/types/api.types';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPrevMonth?: boolean;
  isNextMonth?: boolean;
  prayerData?: DailyPrayerTime;
}

interface YearDropdownOption {
  value: number;
  label: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-umm-qura-calender',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './umm-qura-calender.component.html',
  styles: [
    `
      .rtl {
        direction: rtl;
      }
      .rtl .grid {
        grid-auto-flow: row;
      }
    `,
  ],
})
export class UmmQuraCalenderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Language and RTL support
  isRtl = false;

  // Date state
  currentHijriYear = 1447;
  currentHijriMonth = 1; // Muharram
  currentGregorianYear = 2024;
  currentGregorianMonth = 1; // January

  // Dropdown states
  showHijriYearDropdown = false;
  showGregorianYearDropdown = false;
  showHijriMonthDropdown = false;
  showGregorianMonthDropdown = false;

  // Calendar data
  hijriCalendarDays: CalendarDay[] = [];
  gregorianCalendarDays: CalendarDay[] = [];

  dayHeaders: string[] = [];
  weekDaysData: WeekDayResult[] = [];

  hijriMonths: MonthResult[] = [];
  gregorianMonths: MonthResult[] = [];

  // Year ranges
  hijriYears: number[] = [];
  gregorianYears: number[] = [];

  // Monthly prayer data
  hijriMonthlyData: MonthlyPrayerTimesResult | null = null;
  gregorianMonthlyData: MonthlyPrayerTimesResult | null = null;

  // Loading states
  isLoadingHijriCalendar = false;
  isLoadingGregorianCalendar = false;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private referenceDataService: ReferenceDataService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.initializeYearRanges();
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isRtl = language === 'ar';
        // Re-setup day headers when language changes
        if (this.weekDaysData.length > 0) {
          this.setupDayHeaders();
        }
      });

    this.loadMonthData();
    this.generateCalendars();
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('.year-dropdown') &&
        !target.closest('.month-dropdown')
      ) {
        this.showHijriYearDropdown = false;
        this.showGregorianYearDropdown = false;
        this.showHijriMonthDropdown = false;
        this.showGregorianMonthDropdown = false;
      }
    });
  }

  private loadMonthData(): void {
    // Load Hijri months
    this.referenceDataService
      .getHijriMonths()
      .pipe(takeUntil(this.destroy$))
      .subscribe((months) => {
        this.hijriMonths = months;
      });

    // Load Gregorian months
    this.referenceDataService
      .getGregorianMonths()
      .pipe(takeUntil(this.destroy$))
      .subscribe((months) => {
        this.gregorianMonths = months;
      });

    // Load week days
    this.referenceDataService
      .getWeekDays()
      .pipe(takeUntil(this.destroy$))
      .subscribe((weekDays) => {
        this.weekDaysData = weekDays;
        this.setupDayHeaders();
      });
  }

  private initializeYearRanges(): void {
    // Hijri years (1440-1460)
    for (let year = 1440; year <= 1460; year++) {
      this.hijriYears.push(year);
    }

    // Gregorian years (2020-2030)
    for (let year = 2020; year <= 2030; year++) {
      this.gregorianYears.push(year);
    }
  }

private generateCalendars(): void {
  this.loadHijriCalendar();
  this.loadGregorianCalendar();
}
private getDayName(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}


private loadHijriCalendar(): void {
  this.isLoadingHijriCalendar = true;

  this.apiService
    .getMonthlyPrayerTimesByHijri(
      this.currentHijriYear,
      this.currentHijriMonth,
      undefined,
      undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success && response.result) {
          // 🔹 مابينج من MonthPrayerTimes → MonthlyPrayerTimesResult
          this.hijriMonthlyData = {
            days_in_month: response.result.prayerTimes.length,
            location: {
              latitude: 0, // TODO: هات من الـ API لو بيرجّع location
              longitude: 0,
            },
            daily_prayer_times: response.result.prayerTimes.map((pt) => ({
              hijri_date: pt.hijri_date,
              gregorian_date: pt.gregorian_date,
              day_name: pt.gregorian_date.day_name, 
              prayer_times: {
                fajr: pt.fajr,
                sunrise: pt.sunrise,
                dhuhr: pt.dhuhr,
                asr: pt.asr,
                maghrib: pt.maghrib,
                isha: pt.isha,
                sunset: pt.sunset,
              },
            })),
          };

          this.generateHijriCalendarFromData();
        } else {
          console.error(
            'Failed to load Hijri calendar data:',
            response.error?.message || 'Unknown error'
          );
          this.hijriMonthlyData = null;
          this.generateHijriCalendarFromData(); // Fallback
        }
      },
      error: (error) => {
        console.error('Error loading Hijri calendar:', error);
        this.hijriMonthlyData = null;
        this.generateHijriCalendarFromData(); // Fallback
      },
      complete: () => {
        this.isLoadingHijriCalendar = false;
      },
    });
}


private loadGregorianCalendar(): void {
  this.isLoadingGregorianCalendar = true;

  this.apiService
    .getMonthlyPrayerTimesByGregorian(
      this.currentGregorianYear,
      this.currentGregorianMonth,
      undefined,
      undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {

        if (response.success && response.result) {
          // ✅ Mapping من MonthlyPrayerTimesResult → MonthPrayerTimes
          this.gregorianMonthlyData = {
           days_in_month: response.result.prayerTimes.length,
            location: {
              latitude: 0, // TODO: هات من الـ API لو بيرجّع location
              longitude: 0,
            },
           daily_prayer_times: response.result.prayerTimes.map((pt) => ({
              hijri_date: pt.hijri_date,
              gregorian_date: pt.gregorian_date,
              day_name: pt.gregorian_date.day_name, 
              prayer_times: {
                fajr: pt.fajr,
                sunrise: pt.sunrise,
                dhuhr: pt.dhuhr,
                asr: pt.asr,
                maghrib: pt.maghrib,
                isha: pt.isha,
                sunset: pt.sunset,
              },
            })),
          };
        }
else {
          console.error(
            'Failed to load Gregorian calendar data:',
            response.error?.message || 'Unknown error'
          );
          this.gregorianMonthlyData = null;
          this.generateGregorianCalendarFromData(); // Fallback
        }
      },
      error: (error) => {
        console.error('Error loading Gregorian calendar:', error);
        this.gregorianMonthlyData = null;
        this.generateGregorianCalendarFromData(); // Fallback
      },
      complete: () => {
        this.isLoadingGregorianCalendar = false;
      },
    });
}




private generateHijriCalendarFromData(): void {
  this.hijriCalendarDays = [];

  if (this.hijriMonthlyData && this.hijriMonthlyData.daily_prayer_times) {
    const dailyPrayerTimes = this.hijriMonthlyData.daily_prayer_times;
    const daysInMonth = this.hijriMonthlyData.days_in_month;

    if (!dailyPrayerTimes.length) {
      this.generateStaticHijriCalendar();
      return;
    }

    // أول يوم في الشهر (من التاريخ الهجري لأول يوم)
    const firstDayOfWeek = this.getFirstDayOfWeek(dailyPrayerTimes[0]);
    const totalCells = 42; // 6 rows × 7 days

    // Previous month days (grayed out)
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = daysInMonth - firstDayOfWeek + i + 1;
      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isPrevMonth: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const prayerData = dailyPrayerTimes.find(
        (pt) => pt.hijri_date.day === day
      );
      const isToday = this.isToday(prayerData);

      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected: false,
        prayerData,
      });
    }

    // Next month days (grayed out)
    const remainingCells = totalCells - this.hijriCalendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isNextMonth: true,
      });
    }
  } else {
    // Fallback to static calendar
    this.generateStaticHijriCalendar();
  }
}

  private generateStaticHijriCalendar(): void {
    // Fallback static calendar (existing logic)
    const daysInMonth = 30;
    const firstDayOfWeek = 5;

    const prevMonthDays = [25, 26, 27, 28, 29];
    for (const day of prevMonthDays) {
      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isPrevMonth: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === 3;
      const isSelected = day === 19;

      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    const nextMonthDays = [1, 2, 3, 4, 5, 6];
    for (const day of nextMonthDays) {
      this.hijriCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isNextMonth: true,
      });
    }

    this.hijriCalendarDays.push({
      day: 31,
      isCurrentMonth: true,
      isToday: false,
      isSelected: false,
    });
  }




  private generateGregorianCalendarFromData(): void {
    this.gregorianCalendarDays = [];

    if (
      this.gregorianMonthlyData &&
      this.gregorianMonthlyData.daily_prayer_times
    ) {
      const dailyPrayerTimes = this.gregorianMonthlyData.daily_prayer_times;
      const daysInMonth = this.gregorianMonthlyData.days_in_month;

      // Calculate calendar layout
      const firstDayOfWeek = this.getFirstDayOfWeekGregorian(
        dailyPrayerTimes[0]
      );
      const totalCells = 42; // 6 rows × 7 days

      // Previous month days (grayed out)
      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = this.getPreviousMonthDays() - firstDayOfWeek + i + 1;
        this.gregorianCalendarDays.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isPrevMonth: true,
        });
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const prayerData = dailyPrayerTimes.find(
          (pt) => pt.gregorian_date.day === day
        );
        const isToday = this.isTodayGregorian(prayerData);

        this.gregorianCalendarDays.push({
          day,
          isCurrentMonth: true,
          isToday,
          isSelected: false,
          prayerData,
        });
      }

      // Next month days (grayed out)
      const remainingCells = totalCells - this.gregorianCalendarDays.length;
      for (let day = 1; day <= remainingCells; day++) {
        this.gregorianCalendarDays.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isNextMonth: true,
        });
      }
    } else {
      // Fallback to static calendar
      this.generateStaticGregorianCalendar();
    }
  }

  private generateStaticGregorianCalendar(): void {
    // Fallback static calendar (existing logic)
    const daysInMonth = 31;

    const prevMonthDays = [25, 26, 27, 28, 29];
    for (const day of prevMonthDays) {
      this.gregorianCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isPrevMonth: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === 3;
      const isSelected = day === 19;

      this.gregorianCalendarDays.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    const nextMonthDays = [1, 2, 3, 4, 5, 6];
    for (const day of nextMonthDays) {
      this.gregorianCalendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isNextMonth: true,
      });
    }
  }

  // Navigation methods
  navigateHijriMonth(direction: number): void {
    if (direction > 0) {
      if (this.currentHijriMonth === 12) {
        this.currentHijriMonth = 1;
        this.currentHijriYear++;
      } else {
        this.currentHijriMonth++;
      }
    } else {
      if (this.currentHijriMonth === 1) {
        this.currentHijriMonth = 12;
        this.currentHijriYear--;
      } else {
        this.currentHijriMonth--;
      }
    }
    this.loadHijriCalendar();
  }

  navigateGregorianMonth(direction: number): void {
    if (direction > 0) {
      if (this.currentGregorianMonth === 12) {
        this.currentGregorianMonth = 1;
        this.currentGregorianYear++;
      } else {
        this.currentGregorianMonth++;
      }
    } else {
      if (this.currentGregorianMonth === 1) {
        this.currentGregorianMonth = 12;
        this.currentGregorianYear--;
      } else {
        this.currentGregorianMonth--;
      }
    }
    this.loadGregorianCalendar();
  }

  // Dropdown methods
  toggleHijriYearDropdown(): void {
    this.showHijriYearDropdown = !this.showHijriYearDropdown;
    this.showGregorianYearDropdown = false;
    this.showHijriMonthDropdown = false;
    this.showGregorianMonthDropdown = false;
  }

  toggleGregorianYearDropdown(): void {
    this.showGregorianYearDropdown = !this.showGregorianYearDropdown;
    this.showHijriYearDropdown = false;
    this.showHijriMonthDropdown = false;
    this.showGregorianMonthDropdown = false;
  }

  toggleHijriMonthDropdown(): void {
    this.showHijriMonthDropdown = !this.showHijriMonthDropdown;
    this.showGregorianMonthDropdown = false;
    this.showHijriYearDropdown = false;
    this.showGregorianYearDropdown = false;
  }

  toggleGregorianMonthDropdown(): void {
    this.showGregorianMonthDropdown = !this.showGregorianMonthDropdown;
    this.showHijriMonthDropdown = false;
    this.showHijriYearDropdown = false;
    this.showGregorianYearDropdown = false;
  }

  selectHijriYear(year: number): void {
    this.currentHijriYear = year;
    this.showHijriYearDropdown = false;
    this.loadHijriCalendar();
  }

  selectGregorianYear(year: number): void {
    this.currentGregorianYear = year;
    this.showGregorianYearDropdown = false;
    this.loadGregorianCalendar();
  }

  selectHijriMonth(month: MonthResult): void {
    this.currentHijriMonth = parseInt(month.month_number);
    this.showHijriMonthDropdown = false;
    this.loadHijriCalendar();
  }

  selectGregorianMonth(month: MonthResult): void {
    this.currentGregorianMonth = parseInt(month.month_number);
    this.showGregorianMonthDropdown = false;
    this.loadGregorianCalendar();
  }

  // Date selection
  selectDate(day: CalendarDay, calendarType: 'hijri' | 'gregorian'): void {
    if (!day.isCurrentMonth) return;

    // Clear previous selections
    if (calendarType === 'hijri') {
      this.hijriCalendarDays.forEach((d) => (d.isSelected = false));
      day.isSelected = true;
    } else {
      this.gregorianCalendarDays.forEach((d) => (d.isSelected = false));
      day.isSelected = true;
    }
  }

  // Styling methods
  getCalendarCellClass(day: CalendarDay): string {
    return '';
  }

  getDateStateClass(day: CalendarDay): string {
    let classes = '';

    if (day.isToday) {
      classes += ' border-2 border-[#1B8354]';
    }

    if (day.isSelected) {
      classes += ' bg-[#1B8354]';
    } else {
      classes += ' bg-transparent';
    }

    return classes;
  }

  getDateTextClass(day: CalendarDay): string {
    if (day.isSelected) {
      return 'text-white font-normal';
    } else if (day.isToday) {
      return 'text-[#1B8354] font-bold';
    } else if (!day.isCurrentMonth) {
      return 'text-[#6C737F] font-normal';
    } else {
      return 'text-[#161616] font-normal';
    }
  }

  getHijriMonthName(month: number): string {
    const monthData = this.hijriMonths.find(
      (m) => parseInt(m.month_number) === month
    );
    return monthData ? monthData.month_name : '';
  }

  getGregorianMonthName(month: number): string {
    const monthData = this.gregorianMonths.find(
      (m) => parseInt(m.month_number) === month
    );
    return monthData ? monthData.month_name : '';
  }

  // Utility method for template use
  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // Helper methods for calendar generation
  private getFirstDayOfWeek(prayerData: DailyPrayerTime): number {
    // For Hijri calendar, we need to calculate the day of week for the 1st day of the month
    // This is a simplified calculation using the Gregorian equivalent
    const year = prayerData.gregorian_date.year;
    const month = prayerData.gregorian_date.month - 1; // JS months are 0-based
    const firstDay = new Date(year, month, 1);
    let dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert to our calendar format where Saturday = 0
    // Sunday = 0 -> Saturday = 6, Monday = 1 -> Sunday = 0, etc.
    dayOfWeek = (dayOfWeek + 1) % 7;

    return dayOfWeek;
  }

  private getFirstDayOfWeekGregorian(prayerData: DailyPrayerTime): number {
    // Calculate the day of week for the 1st day of the Gregorian month
    const year = prayerData.gregorian_date.year;
    const month = prayerData.gregorian_date.month - 1; // JS months are 0-based
    const firstDay = new Date(year, month, 1);
    let dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert to our calendar format where Saturday = 0
    dayOfWeek = (dayOfWeek + 1) % 7;

    return dayOfWeek;
  }

  private getPreviousMonthDays(): number {
    // Calculate days in previous month - simplified
    if (this.currentGregorianMonth === 1) {
      return 31; // December has 31 days
    }
    const month = this.currentGregorianMonth - 1;
    const year = this.currentGregorianYear;
    return new Date(year, month, 0).getDate();
  }

  private isToday(prayerData?: DailyPrayerTime): boolean {
    if (!prayerData) return false;
    const today = new Date();
    const todayHijri = this.getTodayHijriDate(); // You'll need to implement this
    return (
      prayerData.hijri_date.day === todayHijri.day &&
      prayerData.hijri_date.month === todayHijri.month &&
      prayerData.hijri_date.year === todayHijri.year
    );
  }

  private isTodayGregorian(prayerData?: DailyPrayerTime): boolean {
    if (!prayerData) return false;
    const today = new Date();
    return (
      prayerData.gregorian_date.day === today.getDate() &&
      prayerData.gregorian_date.month === today.getMonth() + 1 &&
      prayerData.gregorian_date.year === today.getFullYear()
    );
  }

  private getTodayHijriDate(): { day: number; month: number; year: number } {
    // This is a placeholder - you might need to implement proper Hijri date calculation
    // or call an API to get today's Hijri date
    return {
      day: 3,
      month: this.currentHijriMonth,
      year: this.currentHijriYear,
    };
  }

  private setupDayHeaders(): void {
    if (this.weekDaysData.length === 0) {
      // Fallback to static headers
      this.dayHeaders = [
        'سبت',
        'جمعة',
        'خميس',
        'أربعاء',
        'ثلاثاء',
        'إثنين',
        'أحد',
      ];
      return;
    }

    // Sort the week days by day_id to ensure correct order
    const sortedWeekDays = [...this.weekDaysData].sort(
      (a, b) => a.day_id - b.day_id
    );

    // For Arabic calendar, we typically want: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
    // But displayed right-to-left, so we reverse for display
    if (this.isRtl) {
      // For RTL, reverse the order for proper display
      this.dayHeaders = sortedWeekDays.reverse().map((day) => day.day_name);
    } else {
      // For LTR, use normal order
      this.dayHeaders = sortedWeekDays.map((day) => day.day_name);
    }
  }

  // Navigation methods
  navigateToGregorianCalendar(): void {
    this.router.navigate(['/gregorian-calendar'], {
      queryParams: { year: this.currentGregorianYear },
    });
  }

  navigateToHijriCalendar(): void {
    this.router.navigate(['/hijri-calendar'], {
      queryParams: { year: this.currentHijriYear },
    });
  }
}
