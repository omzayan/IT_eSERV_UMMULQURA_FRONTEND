import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { DailyPrayerTimesComponent } from '../daily-prayer-times/daily-prayer-times.component';
import { WeeklyPrayerTimesComponent } from '../weekly-prayer-times/weekly-prayer-times.component';
import { MonthlyPrayerTimesComponent } from '../monthly-prayer-times/monthly-prayer-times.component';
import { HijriMonthlyPrayerTimesComponent } from '../hijri-monthly-prayer-times/hijri-monthly-prayer-times.component';

export type TabType = 'daily' | 'weekly' | 'monthly' | 'monthlyHijri';

interface TabItem {
  id: TabType;
  label: string;
}

@Component({
  selector: 'app-pray-time-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DailyPrayerTimesComponent,
    WeeklyPrayerTimesComponent,
    MonthlyPrayerTimesComponent,
    HijriMonthlyPrayerTimesComponent,
  ],
  template: `
    <div class="px-4 md:px-[80px]">
      <!-- Tabs Section -->
      <div class="flex w-full">
        <div class="flex border-b-2 border-[#D2D6DB] w-full">
          <button
            *ngFor="let tab of tabs"
            (click)="setActiveTab(tab.id)"
            class="px-6 py-3 transition-colors font-ibm-plex-arabic whitespace-nowrap"
            [class]="getTabClasses(tab.id)"
          >
            {{ tab.label | translate }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="">
        <!-- Daily Prayer Times (Table View) -->
        <div *ngIf="activeTab === 'daily'">
          <app-daily-prayer-times></app-daily-prayer-times>
        </div>

        <!-- Weekly Prayer Times -->
        <div *ngIf="activeTab === 'weekly'">
          <app-weekly-prayer-times></app-weekly-prayer-times>
        </div>

        <!-- Monthly Prayer Times (Gregorian) -->
        <div *ngIf="activeTab === 'monthly'">
          <app-monthly-prayer-times></app-monthly-prayer-times>
        </div>

        <!-- Monthly Prayer Times (Hijri) -->
        <div *ngIf="activeTab === 'monthlyHijri'">
          <app-hijri-monthly-prayer-times></app-hijri-monthly-prayer-times>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tab-active {
        border-bottom: 4px solid #1b8354;
        color: #161616;
        font-weight: bold;
      }

      .tab-inactive {
        border-bottom: 4px solid transparent;
        color: #161616;
      }

      .tab-inactive:hover {
        background-color: #f3f4f6;
      }

      .tab-button {
        transition: all 0.2s ease;
        border-radius: 0;
      }
    `,
  ],
})
export class PrayTimeTabsComponent implements OnInit, OnDestroy {
  activeTab: TabType = 'daily';
  isAr = false;
  private destroy$ = new Subject<void>();

  tabs: TabItem[] = [
    { id: 'daily', label: 'prayTimeTable.tabs.daily' },
    { id: 'weekly', label: 'prayTimeTable.tabs.weekly' },
    { id: 'monthly', label: 'prayTimeTable.tabs.monthly' },
    { id: 'monthlyHijri', label: 'prayTimeTable.tabs.monthlyHijri' },
  ];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tabId: TabType): void {
    this.activeTab = tabId;
  }

  getTabClasses(tabId: TabType): string {
    const baseClasses = 'tab-button';
    const activeClasses = 'tab-active';
    const inactiveClasses = 'tab-inactive';

    return `${baseClasses} ${
      this.activeTab === tabId ? activeClasses : inactiveClasses
    }`;
  }
}
