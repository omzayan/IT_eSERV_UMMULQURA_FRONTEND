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
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { MonthResult } from '../../../core/types/api.types';

export interface HijriMonthYearValue {
  month: number;
  year: number;
}

@Component({
  selector: 'app-hijri-month-year-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './hijri-month-year-picker.component.html',
  styleUrls: ['./hijri-month-year-picker.component.css'],
})
export class HijriMonthYearPickerComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() disabled: boolean = false;
  @Input() value?: HijriMonthYearValue | null;
  @Output() valueChange = new EventEmitter<HijriMonthYearValue | null>();

  private destroy$ = new Subject<void>();

  // Calendar state
  showCalendar: boolean = false;
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  displayValue: string = '';

  // Calendar view state
  currentViewType: 'year' | 'month' = 'month';
  months: MonthResult[] = [];

  // Year range for selection
  yearRange: number[] = [];
  currentYearPage = 0;
  yearsPerPage = 12;

  // Current date for highlighting
  currentDate = new Date();

  constructor(private referenceDataService: ReferenceDataService) {
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
    if (changes['value']) {
      this.initializeFromValue();
      this.updateDisplayValue();
    }
  }

  private initializeFromValue() {
    if (this.value) {
      this.selectedYear = this.value.year;
      this.selectedMonth = this.value.month;
    } else {
      // Initialize with null values
      this.selectedYear = null;
      this.selectedMonth = null;
    }
  }

  private loadMonths() {
    this.referenceDataService
      .getHijriMonths()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (months) => {
          this.months = months;
        },
        error: (error) => {
          console.error('Error loading months:', error);
          // Fallback to default months
          this.setFallbackMonths();
        },
      });
  }

  private setFallbackMonths() {
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
  }

  private generateYearRange() {
    const currentHijriYear = 1446; // Current approximate Hijri year
    const startYear = 1400;
    const endYear = 1500;

    this.yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      this.yearRange.push(year);
    }
  }

  private updateDisplayValue() {
    if (this.selectedYear && this.selectedMonth) {
      const monthName = this.getMonthName(this.selectedMonth);
      this.displayValue = `${monthName} ${this.selectedYear} H`;
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
        if (!this.selectedYear || !this.selectedMonth) {
          this.selectedYear = 1446; // Current approximate Hijri year
          this.selectedMonth = 1;
        }
        this.currentViewType = 'month';
      }
    }
  }

  closeCalendar() {
    this.showCalendar = false;
    this.currentViewType = 'month';
  }

  // View navigation
  switchToYearView() {
    this.currentViewType = 'year';
  }

  switchToMonthView() {
    this.currentViewType = 'month';
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
    this.updateDisplayValue();
    this.emitChange();
    this.closeCalendar();
  }

  // Utility methods
  getMonthDisplayName(): string {
    return this.getMonthName(this.selectedMonth) || '';
  }

  getPlaceholderText(): string {
    if (this.placeholder) {
      return this.placeholder;
    }
    return 'mm-yyyy H';
  }

  getLabelText(): string {
    if (this.label) {
      return this.label;
    }
    return 'datePickers.hijri.selectDate';
  }

  private emitChange() {
    if (this.selectedMonth && this.selectedYear) {
      const monthYearValue: HijriMonthYearValue = {
        month: this.selectedMonth,
        year: this.selectedYear,
      };
      this.valueChange.emit(monthYearValue);
    } else {
      this.valueChange.emit(null);
    }
  }
}
