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

export interface GregorianMonthYearValue {
  month: number;
  year: number;
}

@Component({
  selector: 'app-gregorian-month-year-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './gregorian-month-year-picker.component.html',
  styleUrls: ['./gregorian-month-year-picker.component.css'],
})
export class GregorianMonthYearPickerComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() disabled: boolean = false;
  @Input() value?: GregorianMonthYearValue | null;
  @Output() valueChange = new EventEmitter<GregorianMonthYearValue | null>();

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
    .getGregorianMonths()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (months) => {
        this.months = months;
        console.log('months', this.months);
      },
      error: (error) => {
        console.error('Error loading months:', error);
        this.setFallbackMonths();
      },
    });
}


  private setFallbackMonths() {
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

  private generateYearRange() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 50;
    const endYear = currentYear + 10;

    this.yearRange = [];
    for (let year = startYear; year <= endYear; year++) {
      this.yearRange.push(year);
    }
  }

  private updateDisplayValue() {
    if (this.selectedYear && this.selectedMonth) {
      const monthName = this.getMonthName(this.selectedMonth);
      this.displayValue = `${monthName} ${this.selectedYear}`;
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
          const now = new Date();
          this.selectedYear = now.getFullYear();
          this.selectedMonth = now.getMonth() + 1;
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
    return 'اختر التاريخ';
  }

 getLabelText(): string {
  return this.label ?? '';
}


  private emitChange() {
    if (this.selectedMonth && this.selectedYear) {
      const monthYearValue: GregorianMonthYearValue = {
        month: this.selectedMonth,
        year: this.selectedYear,
      };
      this.valueChange.emit(monthYearValue);
    } else {
      this.valueChange.emit(null);
    }
  }
}
