import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { MonthResult } from '../../../core/types/api.types';

export interface DatePickerValue {
  dayNumber: number;
  month: number;
  year: number;
}

export type DatePickerType = 'hijri' | 'gregorian';

@Component({
  selector: 'app-unified-date-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './unified-date-picker.component.html',
  styleUrls: ['./unified-date-picker.component.css'],
})
export class UnifiedDatePickerComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() type: DatePickerType = 'hijri';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() disabled: boolean = false;
  @Input() value?: DatePickerValue | null;
  @Output() valueChange = new EventEmitter<DatePickerValue | null>();

  private destroy$ = new Subject<void>();

  // Calendar state
  showCalendar: boolean = false;
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedDay: number | null = null;
  displayValue: string = '';

  // Calendar view state
  currentViewType: 'year' | 'month' | 'day' = 'day';
  calendarDays: number[] = [];
  calendarWeeks: number[][] = [];
  months: MonthResult[] = [];

  // Year range for selection
  yearRange: number[] = [];
  currentYearPage = 0;
  yearsPerPage = 12;

  // Current date for highlighting
  currentDate = new Date();

  constructor(
    private referenceDataService: ReferenceDataService,
    private cdr: ChangeDetectorRef
  ) {
    // Don't initialize default values - keep null
  }

  ngOnInit() {
    this.loadMonths();
    this.initializeFromValue();
    this.generateYearRange();
    this.updateDisplayValue();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      // When type changes, reload months and reset calendar state
      this.loadMonths();
      this.generateYearRange();
      this.initializeDefaultValues();
      this.updateDisplayValue();
      this.showCalendar = false; // Close calendar to avoid confusion
      this.emitChange(); // Notify parent that value has been reset
    }

    if (changes['value']) {
      this.initializeFromValue();
      this.updateDisplayValue();
      if (this.selectedYear && this.selectedMonth) {
        this.generateCalendar();
      }
    }
  }

  private initializeDefaultValues() {
    // Set all values to null by default
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDay = null;
  }

  private initializeFromValue() {
    if (this.value) {
      this.selectedYear = this.value.year;
      this.selectedMonth = this.value.month;
      this.selectedDay = this.value.dayNumber;
    } else {
      // Initialize with null values
      this.selectedYear = null;
      this.selectedMonth = null;
      this.selectedDay = null;
    }
  }

  private loadMonths() {
    const monthsObservable =
      this.type === 'hijri'
        ? this.referenceDataService.getHijriMonths()
        : this.referenceDataService.getGregorianMonths();

    monthsObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (months) => {
        this.months = months;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error loading months:', error);
        // Fallback to default months
        this.setFallbackMonths();
        this.cdr.detectChanges(); // Force change detection
      },
    });
  }

  private setFallbackMonths() {
    if (this.type === 'hijri') {
      this.months = [
        { month_number: '1', month_name: 'Muharram' },
        { month_number: '2', month_name: 'Safar' },
        { month_number: '3', month_name: "Rabi' al-Awwal" },
        { month_number: '4', month_name: "Rabi' al-Thani" },
        { month_number: '5', month_name: 'Jumada al-Awwal' },
        { month_number: '6', month_name: 'Jumada al-Thani' },
        { month_number: '7', month_name: 'Rajab' },
        { month_number: '8', month_name: "Sha'ban" },
        { month_number: '9', month_name: 'Ramadan' },
        { month_number: '10', month_name: 'Shawwal' },
        { month_number: '11', month_name: "Dhul Qa'dah" },
        { month_number: '12', month_name: 'Dhul Hijjah' },
      ];
    } else {
      this.months = [
        { month_number: '1', month_name: 'January' },
        { month_number: '2', month_name: 'February' },
        { month_number: '3', month_name: 'March' },
        { month_number: '4', month_name: 'April' },
        { month_number: '5', month_name: 'May' },
        { month_number: '6', month_name: 'June' },
        { month_number: '7', month_name: 'July' },
        { month_number: '8', month_name: 'August' },
        { month_number: '9', month_name: 'September' },
        { month_number: '10', month_name: 'October' },
        { month_number: '11', month_name: 'November' },
        { month_number: '12', month_name: 'December' },
      ];
    }
  }

  private generateYearRange() {
    const currentYear = this.type === 'hijri' ? 1446 : new Date().getFullYear();
    const startYear = this.type === 'hijri' ? 1400 : currentYear - 50;
    const endYear = this.type === 'hijri' ? 1500 : currentYear + 10;

    this.yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      this.yearRange.push(year);
    }
  }

  private updateDisplayValue() {
    if (this.selectedYear && this.selectedMonth && this.selectedDay) {
      const monthName = this.getMonthName(this.selectedMonth);
      this.displayValue = `${this.selectedDay} ${monthName} ${this.selectedYear}`;
    } else {
      this.displayValue = '';
    }
  }

  private getMonthName(monthNumber: number | null): string {
    if (!monthNumber) return '';
    const month = this.months.find(
      (m) => parseInt(m.month_number) === monthNumber
    );
    return month ? month.month_name : monthNumber.toString();
  }

  // Event handlers
  toggleCalendar() {
    if (!this.disabled) {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        // Initialize calendar with current date if no value is selected
        if (!this.selectedYear || !this.selectedMonth || !this.selectedDay) {
          const now = new Date();
          if (this.type === 'hijri') {
            this.selectedYear = 1446; // Current approximate Hijri year
            this.selectedMonth = 1;
          } else {
            this.selectedYear = now.getFullYear();
            this.selectedMonth = now.getMonth() + 1;
          }
        }
        this.currentViewType = 'day';
        this.generateCalendar();
      }
    }
  }

  closeCalendar() {
    this.showCalendar = false;
    this.currentViewType = 'day';
  }

  // View navigation
  switchToYearView() {
    this.currentViewType = 'year';
  }

  switchToMonthView() {
    this.currentViewType = 'month';
  }

  switchToDayView() {
    this.currentViewType = 'day';
    this.generateCalendar();
  }

  // Year selection
  get displayedYears(): number[] {
    const start = this.currentYearPage * this.yearsPerPage;
    return this.yearRange.slice(start, start + this.yearsPerPage);
  }

  previousYearPage() {
    if (this.currentYearPage > 0) {
      this.currentYearPage--;
    }
  }

  nextYearPage() {
    const maxPage = Math.ceil(this.yearRange.length / this.yearsPerPage) - 1;
    if (this.currentYearPage < maxPage) {
      this.currentYearPage++;
    }
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.switchToMonthView();
  }

  // Month selection
  selectMonth(monthNumber: number) {
    this.selectedMonth = monthNumber;
    this.switchToDayView();
  }

  // Day selection
  selectDay(day: number) {
    if (day > 0) {
      this.selectedDay = day;
      this.updateDisplayValue();
      this.emitChange();
      this.closeCalendar();
    }
  }

  // Calendar navigation
  previousMonth() {
    if (this.selectedMonth && this.selectedYear) {
      if (this.selectedMonth === 1) {
        this.selectedMonth = 12;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
      this.generateCalendar();
    }
  }

  nextMonth() {
    if (this.selectedMonth && this.selectedYear) {
      if (this.selectedMonth === 12) {
        this.selectedMonth = 1;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
      this.generateCalendar();
    }
  }

  // Calendar generation
  private generateCalendar() {
    if (!this.selectedYear || !this.selectedMonth) return;

    const daysInMonth = this.getDaysInMonth(
      this.selectedYear,
      this.selectedMonth
    );
    const firstDayOfWeek = this.getFirstDayOfWeek(
      this.selectedYear,
      this.selectedMonth
    );

    // Generate array of days
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate weeks for calendar grid
    this.calendarWeeks = [];
    let currentWeek: number[] = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(0);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        this.calendarWeeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Complete last week with empty cells
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(0);
    }
    if (currentWeek.length > 0) {
      this.calendarWeeks.push(currentWeek);
    }
  }

  private getDaysInMonth(year: number, month: number): number {
    if (this.type === 'hijri') {
      // Simplified Hijri calendar - odd months have 30 days, even have 29
      // 12th month (Dhul Hijjah) has 30 days in leap years
      if (month % 2 === 1) {
        return 30; // Odd months have 30 days
      } else if (month === 12 && this.isHijriLeapYear(year)) {
        return 30; // Dhul Hijjah has 30 days in leap years
      } else {
        return 29; // Even months have 29 days
      }
    } else {
      // Gregorian calendar
      return new Date(year, month, 0).getDate();
    }
  }

  private getFirstDayOfWeek(year: number, month: number): number {
    if (this.type === 'hijri') {
      // For Hijri calendar, we'll use a simplified calculation
      // In a real implementation, you'd use proper Hijri-Gregorian conversion
      return 0; // Simplified - start from Saturday
    } else {
      // Gregorian calendar - get first day of month (0 = Sunday, 6 = Saturday)
      // Convert to Saturday-start week (Saturday = 0, Sunday = 1, ..., Friday = 6)
      const firstDay = new Date(year, month - 1, 1).getDay();
      return firstDay === 0 ? 1 : firstDay === 6 ? 0 : firstDay + 1;
    }
  }

  private isHijriLeapYear(year: number): boolean {
    // Simplified leap year calculation for Hijri calendar
    return (11 * year + 14) % 30 < 11;
  }

  // Utility methods
  getMonthDisplayName(): string {
    return this.getMonthName(this.selectedMonth) || '';
  }

  getPlaceholderText(): string {
    if (this.placeholder) {
      return this.placeholder;
    }
    return 'dd-mm-yy';
  }

  getLabelText(): string {
    if (this.label) {
      return this.label;
    }
    return this.type === 'hijri'
      ? 'datePickers.hijri.selectDate'
      : 'datePickers.gregorian.selectDate';
  }

  isToday(day: number): boolean {
    if (this.type === 'gregorian' && this.selectedMonth && this.selectedYear) {
      return (
        day === this.currentDate.getDate() &&
        this.selectedMonth === this.currentDate.getMonth() + 1 &&
        this.selectedYear === this.currentDate.getFullYear()
      );
    }
    return false; // Simplified for Hijri
  }

  isSelected(day: number): boolean {
    return this.selectedDay !== null && day === this.selectedDay;
  }

  private emitChange() {
    if (this.selectedDay && this.selectedMonth && this.selectedYear) {
      const dateValue: DatePickerValue = {
        dayNumber: this.selectedDay,
        month: this.selectedMonth,
        year: this.selectedYear,
      };
      // console.log(dateValue);

      this.valueChange.emit(dateValue);
    } else {
      this.valueChange.emit(null);
    }
  }
}
