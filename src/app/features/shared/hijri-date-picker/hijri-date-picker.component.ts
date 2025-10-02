import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface HijriDateValue {
  year: number;
  month: number;
  day: number;
}

@Component({
  selector: 'app-hijri-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './hijri-date-picker.component.html',
  styleUrls: ['./hijri-date-picker.component.css'],
})
export class HijriDatePickerComponent implements OnInit {
  @Input() label?: string = 'datePickers.hijri.selectDate';
  @Input() disabled: boolean = false;
  @Input() value?: HijriDateValue;
  @Output() valueChange = new EventEmitter<HijriDateValue>();

  // For simplicity, we'll use a string input that the user can format as needed
  // In a real application, you'd want to use a proper Hijri calendar library
  selectedHijriDate: string = '';
  selectedYear: number = 1445;
  selectedMonth: number = 1;
  selectedDay: number = 1;

  showCalendar: boolean = false;
  calendarDays: number[] = [];
  calendarWeeks: number[][] = [];

  // For highlighting current day
  currentYear: number = 1445;
  currentMonth: number = 1;
  currentDay: number = 1;

  months = [
    { value: 1, labelKey: 'datePickers.hijri.months.muharram' },
    { value: 2, labelKey: 'datePickers.hijri.months.safar' },
    { value: 3, labelKey: 'datePickers.hijri.months.rabiAlAwwal' },
    { value: 4, labelKey: 'datePickers.hijri.months.rabiAlThani' },
    { value: 5, labelKey: 'datePickers.hijri.months.jumadaAlAwwal' },
    { value: 6, labelKey: 'datePickers.hijri.months.jumadaAlThani' },
    { value: 7, labelKey: 'datePickers.hijri.months.rajab' },
    { value: 8, labelKey: 'datePickers.hijri.months.shaban' },
    { value: 9, labelKey: 'datePickers.hijri.months.ramadan' },
    { value: 10, labelKey: 'datePickers.hijri.months.shawwal' },
    { value: 11, labelKey: 'datePickers.hijri.months.dhulQadah' },
    { value: 12, labelKey: 'datePickers.hijri.months.dhulHijjah' },
  ];

  ngOnInit() {
    if (this.value) {
      this.selectedYear = this.value.year;
      this.selectedMonth = this.value.month;
      this.selectedDay = this.value.day;
      this.selectedHijriDate = this.formatHijriDate();
    } else {
      this.selectedHijriDate = this.formatHijriDate();
    }
  }

  onDateInput(event: any) {
    const inputValue = event.target.value;
    this.selectedHijriDate = inputValue;
    this.parseAndEmitHijriDate(inputValue);
  }

  private parseAndEmitHijriDate(dateString: string) {
    // Simple parsing for format: DD/MM/YYYY or DD-MM-YYYY
    const datePattern = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/;
    const match = dateString.match(datePattern);

    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);

      // Validate ranges
      if (
        year >= 1300 &&
        year <= 1500 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 30
      ) {
        this.selectedYear = year;
        this.selectedMonth = month;
        this.selectedDay = day;
        this.emitChange();
      }
    }
  }

  private formatHijriDate(): string {
    return `${this.selectedDay.toString().padStart(2, '0')}/${this.selectedMonth
      .toString()
      .padStart(2, '0')}/${this.selectedYear}`;
  }

  private emitChange() {
    const dateValue: HijriDateValue = {
      year: this.selectedYear,
      month: this.selectedMonth,
      day: this.selectedDay,
    };
    this.valueChange.emit(dateValue);
  }

  toggleCalendar() {
    if (!this.disabled) {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        this.generateCalendar();
      }
    }
  }

  selectDay(day: number) {
    this.selectedDay = day;
    this.selectedHijriDate = this.formatHijriDate();
    this.emitChange();
    this.showCalendar = false;
  }

  previousMonth() {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.generateCalendar();
  }

  private generateCalendar() {
    // Calculate days in current month
    let daysInMonth: number;
    if (this.selectedMonth % 2 === 1) {
      daysInMonth = 30; // Odd months have 30 days
    } else {
      daysInMonth = 29; // Even months have 29 days
    }

    // The 12th month (Dhul Hijjah) has 30 days in leap years
    if (this.selectedMonth === 12 && this.isHijriLeapYear(this.selectedYear)) {
      daysInMonth = 30;
    }

    // Generate array of days
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate weeks for calendar grid
    this.calendarWeeks = [];
    let currentWeek: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day === daysInMonth) {
        // Fill remaining slots in last week
        while (currentWeek.length < 7 && day === daysInMonth) {
          currentWeek.push(0); // 0 represents empty cell
        }
        this.calendarWeeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
  }

  private isHijriLeapYear(year: number): boolean {
    // Simplified leap year calculation for Hijri calendar
    return (11 * year + 14) % 30 < 11;
  }

  getCurrentDay(): number {
    return this.currentDay;
  }

  reset() {
    this.selectedYear = 1445;
    this.selectedMonth = 1;
    this.selectedDay = 1;
    this.selectedHijriDate = this.formatHijriDate();
    this.showCalendar = false;
    // Don't emit change on reset to avoid infinite loops
  }
}
