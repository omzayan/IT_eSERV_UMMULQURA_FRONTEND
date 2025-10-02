import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

interface HijriMonthOption {
  value: number;
  label: string;
}

interface HijriYearOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-hijri-month-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div
      class="flex flex-col gap-4 w-full"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <!-- Year Selector -->
      <div class="flex flex-col gap-2 items-start w-full">
        <label
          for="hijriYearSelect"
          class="text-base font-medium text-[#161616] font-ibm-plex-arabic"
        >
          {{ 'datePickers.hijri.selectYear' | translate }}
        </label>
        <div class="relative w-full">
          <select
            name="hijriYearSelect"
            id="hijriYearSelect"
            [(ngModel)]="selectedYear"
            (ngModelChange)="onSelectionChange()"
            class="ps-4 pe-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B8354] focus:border-transparent w-full appearance-none font-ibm-plex-arabic"
          >
            <option value="" disabled>
              {{ 'datePickers.hijri.selectYear' | translate }}
            </option>
            <option *ngFor="let year of yearOptions" [value]="year.value">
              {{ year.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Month Selector -->
      <div class="flex flex-col gap-2 items-start w-full">
        <label
          for="hijriMonthSelect"
          class="text-base font-medium text-[#161616] font-ibm-plex-arabic"
        >
          {{ 'hijriMonthSelect.selectMonth' | translate }}
        </label>
        <div class="relative w-full">
          <select
            name="hijriMonthSelect"
            id="hijriMonthSelect"
            [(ngModel)]="selectedMonth"
            (ngModelChange)="onSelectionChange()"
            class="ps-4 pe-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B8354] focus:border-transparent w-full appearance-none font-ibm-plex-arabic"
          >
            <option value="" disabled>
              {{ 'hijriMonthSelect.selectMonth' | translate }}
            </option>
            <option *ngFor="let month of monthOptions" [value]="month.value">
              {{ month.label | translate }}
            </option>
          </select>
        </div>
      </div>
    </div>
  `,
})
export class HijriMonthSelectorComponent implements OnInit, OnDestroy {
  @Input() year: number | null = null;
  @Input() month: number | null = null;
  @Output() selectionChange = new EventEmitter<{
    year: number;
    month: number;
  }>();

  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  yearOptions: HijriYearOption[] = [];
  monthOptions: HijriMonthOption[] = [];
  isAr = false;

  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.selectedYear = this.year;
    this.selectedMonth = this.month;

    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.generateOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateOptions(): void {
    // Generate Hijri years (current year and nearby years)
    const currentHijriYear = 1445; // Approximate current Hijri year
    this.yearOptions = [];

    for (
      let year = currentHijriYear - 5;
      year <= currentHijriYear + 5;
      year++
    ) {
      this.yearOptions.push({
        value: year,
        label: `${year} H`,
      });
    }

    // Generate Hijri months
    const monthKeys = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];

    this.monthOptions = monthKeys.map((key, index) => ({
      value: index + 1,
      label: `hijriMonthSelect.months.${key}`,
    }));
  }

  onSelectionChange(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.selectionChange.emit({
        year: this.selectedYear,
        month: this.selectedMonth,
      });
    }
  }
}
