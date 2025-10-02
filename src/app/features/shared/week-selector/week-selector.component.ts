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

interface WeekOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-week-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div
      class="flex flex-col gap-2 items-start w-full"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <label
        for="weekSelect"
        class="text-base font-medium text-[#161616] font-ibm-plex-arabic"
      >
        {{ 'weekSelect.selectWeek' | translate }}
      </label>
      <div class="relative w-full">
        <select
          name="weekSelect"
          id="weekSelect"
          [(ngModel)]="selectedWeek"
          (ngModelChange)="onWeekChange($event)"
          class="ps-4 pe-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B8354] focus:border-transparent w-full appearance-none font-ibm-plex-arabic"
        >
          <option value="" disabled>
            {{ 'weekSelect.selectWeekPlaceholder' | translate }}
          </option>
          <option *ngFor="let week of weekOptions" [value]="week.value">
            {{ week.label }}
          </option>
        </select>
      </div>
    </div>
  `,
})
export class WeekSelectorComponent implements OnInit, OnDestroy {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  selectedWeek = '';
  weekOptions: WeekOption[] = [];
  isAr = false;

  private destroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.selectedWeek = this.value;

    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.generateWeekOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateWeekOptions(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get first day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    this.weekOptions = [];

    // Generate weeks for current month
    let weekStart = new Date(firstDay);
    let weekNumber = 1;

    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Don't go beyond the current month
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }

      const startStr = this.formatDateString(weekStart);
      const endStr = this.formatDateString(weekEnd);
      const weekValue = `${startStr}_${endStr}`;

      this.weekOptions.push({
        value: weekValue,
        label: `Week ${weekNumber} (${weekStart.getDate()} - ${weekEnd.getDate()})`,
      });

      weekStart.setDate(weekStart.getDate() + 7);
      weekNumber++;
    }
  }

  formatDateString(date: Date): string {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }

  onWeekChange(value: string): void {
    this.selectedWeek = value;
    this.valueChange.emit(value);
  }
}
