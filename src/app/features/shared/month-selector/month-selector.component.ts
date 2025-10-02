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

interface MonthOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div
      class="flex flex-col gap-2 items-start w-full"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <label
        for="monthSelect"
        class="text-base font-medium text-[#161616] font-ibm-plex-arabic"
      >
        {{ 'miladiMonthSelect.selectMonth' | translate }}
      </label>
      <div class="relative w-full">
        <select
          name="monthSelect"
          id="monthSelect"
          [(ngModel)]="selectedMonth"
          (ngModelChange)="onMonthChange($event)"
          class="ps-4 pe-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B8354] focus:border-transparent w-full appearance-none font-ibm-plex-arabic"
        >
          <option value="" disabled>
            {{ 'miladiMonthSelect.selectMonth' | translate }}
          </option>
          <option *ngFor="let month of monthOptions" [value]="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>
    </div>
  `,
})
export class MonthSelectorComponent implements OnInit, OnDestroy {
  @Input() value: number | null = null;
  @Output() valueChange = new EventEmitter<number>();

  selectedMonth: number | null = null;
  monthOptions: MonthOption[] = [];
  isAr = false;

  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.selectedMonth = this.value;

    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.generateMonthOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateMonthOptions(): void {
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
      label: `miladiMonthSelect.months.${key}`, // This will be translated
    }));
  }

  onMonthChange(value: number): void {
    this.selectedMonth = value;
    this.valueChange.emit(value);
  }
}
