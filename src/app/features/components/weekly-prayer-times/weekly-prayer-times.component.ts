import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CitySelectorComponent } from '../../shared/city-selector/city-selector.component';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
} from '../../shared/unified-date-picker/unified-date-picker.component';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';
import { DailyPrayerTime } from '../../../core/types/api.types';

interface LocationState {
  cityId?: number;
  lat?: number;
  lng?: number;
}

interface DateRangeState {
  startDate?: DatePickerValue | null;
  endDate?: DatePickerValue | null;
}

type DateRangeType = 'gregorian' | 'hijri';

interface PrayerTimeRow {
  day: string;
  hijriDate: string;
  gregorianDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

@Component({
  selector: 'app-weekly-prayer-times',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CitySelectorComponent,
    UnifiedDatePickerComponent,
  ],
  template: `
    <div class="p-4 md:p-[80px] flex flex-col gap-6 bg-[#F9FAFB]">
      <!-- Date Range Type Selection -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3
          class="text-lg font-medium text-[#384250] mb-4 font-ibm-plex-arabic"
        >
          {{ 'prayTimeTable.selectDateRange' | translate }}
        </h3>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              [(ngModel)]="selectedDateRangeType"
              value="gregorian"
              class="w-4 h-4 text-[#1B8354] border-gray-300 focus:ring-[#1B8354]"
            />
            <span class="text-[#384250] font-ibm-plex-arabic">
              {{ 'prayTimeTable.headers.gregorian' | translate }}
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              [(ngModel)]="selectedDateRangeType"
              value="hijri"
              class="w-4 h-4 text-[#1B8354] border-gray-300 focus:ring-[#1B8354]"
            />
            <span class="text-[#384250] font-ibm-plex-arabic">
              {{ 'prayTimeTable.headers.hijri' | translate }}
            </span>
          </label>
        </div>
      </div>

      <!-- Gregorian Date Range -->
      <div
        *ngIf="selectedDateRangeType === 'gregorian'"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <h4
          class="text-md font-medium text-[#384250] mb-4 font-ibm-plex-arabic"
        >
          {{ 'prayTimeTable.headers.gregorian' | translate }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <app-unified-date-picker
              type="gregorian"
              [value]="gregorianDateRange.startDate"
              (valueChange)="handleGregorianStartDateChange($event)"
              [placeholder]="'startDate' | translate"
              [label]="'startDate' | translate"
            ></app-unified-date-picker>
          </div>
          <div>
            <app-unified-date-picker
              type="gregorian"
              [value]="gregorianDateRange.endDate"
              (valueChange)="handleGregorianEndDateChange($event)"
              [placeholder]="'endDate' | translate"
              [label]="'endDate' | translate"
            ></app-unified-date-picker>
          </div>
        </div>
      </div>

      <!-- Hijri Date Range -->
      <div
        *ngIf="selectedDateRangeType === 'hijri'"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <h4
          class="text-md font-medium text-[#384250] mb-4 font-ibm-plex-arabic"
        >
          {{ 'prayTimeTable.headers.hijri' | translate }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <app-unified-date-picker
              type="hijri"
              [value]="hijriDateRange.startDate"
              (valueChange)="handleHijriStartDateChange($event)"
              [placeholder]="'startDate' | translate"
              [label]="'startDate' | translate"
            ></app-unified-date-picker>
          </div>
          <div>
            <app-unified-date-picker
              type="hijri"
              [value]="hijriDateRange.endDate"
              (valueChange)="handleHijriEndDateChange($event)"
              [placeholder]="'endDate' | translate"
              [label]="'endDate' | translate"
            ></app-unified-date-picker>
          </div>
        </div>
      </div>

      <!-- Location Selection -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <app-city-selector
          [label]="'citySelect.selectCity'"
          (citySelect)="handleCitySelect($event)"
          (locationSelect)="handleLocationSelect($event)"
        ></app-city-selector>
      </div>

      <!-- Fetch Button -->
      <div class="flex w-full">
        <button
          (click)="fetchDateRangeData()"
          [disabled]="!isFormValid() || loading"
          class="bg-[#1B8354] py-3 px-6 rounded text-white w-full font-medium hover:bg-[#156841] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-ibm-plex-arabic"
        >
          {{
            loading
              ? ('common.loading' | translate)
              : ('prayTimeTable.showPrayerTimes' | translate)
          }}
        </button>
      </div>

      <!-- Prayer Times Table -->
      <div
        *ngIf="prayerTimes.length > 0"
        class="flex flex-col w-full rounded-2xl border border-[#D2D6DB] overflow-hidden"
      >
        <!-- Table Container with Horizontal Scroll -->
        <div class="overflow-x-auto">
          <div class="min-w-max">
            <!-- Prayer Times Table -->
            <table class="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ 'prayTimeTable.headers.dayName' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayTimeTable.headers.hijriDate' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayTimeTable.headers.gregorianDate' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.fajr' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.sunrise' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.dhuhr' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.asr' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.maghrib' | translate }}
                  </th>
                  <th
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] border-s whitespace-nowrap"
                  >
                    {{ 'prayers.isha' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let row of prayerTimes; let i = index"
                  class="font-ibm-plex-arabic bg-white border-b border-[#D2D6DB]"
                >
                  <td class="text-[#384250] p-4 whitespace-nowrap">
                    {{ row.day_name || '--' }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ row.hijri_date.formatted || '--' }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ row.gregorian_date.formatted || '--' }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.fajr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.sunrise) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.dhuhr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.asr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.maghrib) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(row.prayer_times.isha) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WeeklyPrayerTimesComponent implements OnInit, OnDestroy {
  selectedDateRangeType: DateRangeType = 'gregorian';
  gregorianDateRange: DateRangeState = {};
  hijriDateRange: DateRangeState = {};
  selectedLocation: LocationState = {};
  prayerTimes: DailyPrayerTime[] = [];
  loading = false;
  isAr = false;

  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private apiService: ApiService,
    private languageService: LanguageService
  ) {}

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

  getDayName(date: Date): string {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    return this.translate.instant(`daySelect.days.${dayNames[dayOfWeek]}`);
  }

  // Date change handlers
  handleGregorianStartDateChange(date: DatePickerValue | null): void {
    this.gregorianDateRange.startDate = date;
  }

  handleGregorianEndDateChange(date: DatePickerValue | null): void {
    this.gregorianDateRange.endDate = date;
  }

  handleHijriStartDateChange(date: DatePickerValue | null): void {
    this.hijriDateRange.startDate = date;
  }

  handleHijriEndDateChange(date: DatePickerValue | null): void {
    this.hijriDateRange.endDate = date;
  }

  handleLocationSelect(location: { lat: number; lng: number }): void {
    // Clear cityId when coordinates are selected
    this.selectedLocation = {
      lat: location.lat,
      lng: location.lng,
      cityId: undefined,
    };
  }

  handleCitySelect(cityId: string): void {
    // Clear coordinates when cityId is selected
    this.selectedLocation = {
      cityId: parseInt(cityId),
      lat: undefined,
      lng: undefined,
    };
  }

  // Form validation
  isFormValid(): boolean {
    const hasLocation =
      !!this.selectedLocation.cityId ||
      !!(this.selectedLocation.lat && this.selectedLocation.lng);

    if (this.selectedDateRangeType === 'gregorian') {
      return (
        hasLocation &&
        !!this.gregorianDateRange.startDate &&
        !!this.gregorianDateRange.endDate
      );
    } else {
      return (
        hasLocation &&
        !!this.hijriDateRange.startDate &&
        !!this.hijriDateRange.endDate
      );
    }
  }

  // Convert DatePickerValue to Date object for Gregorian dates
  private datePickerValueToGregorianDate(dateValue: DatePickerValue): Date {
    return new Date(dateValue.year, dateValue.month - 1, dateValue.dayNumber);
  }

  // Convert DatePickerValue to Date object for Hijri dates
  // Note: For Hijri dates, we create a date with the Hijri values but will let the API handle the conversion
  private datePickerValueToHijriDate(dateValue: DatePickerValue): Date {
    // For Hijri dates, we'll pass the raw values and let the API service handle the conversion
    // This is a simplified approach - in a real implementation, you'd use a proper Hijri-to-Gregorian converter
    return new Date(dateValue.year, dateValue.month - 1, dateValue.dayNumber);
  }

  async fetchDateRangeData(): Promise<void> {
    try {
      this.loading = true;

      if (!this.isFormValid()) {
        return;
      }

      let startDate: Date;
      let endDate: Date;
      let response;

      if (this.selectedDateRangeType === 'gregorian') {
        startDate = this.datePickerValueToGregorianDate(
          this.gregorianDateRange.startDate!
        );
        endDate = this.datePickerValueToGregorianDate(
          this.gregorianDateRange.endDate!
        );

        if (this.selectedLocation.cityId) {
          response = await this.apiService
            .getGregorianDateRangeCalendar(
              startDate,
              endDate,
              undefined,
              undefined,
              this.selectedLocation.cityId
            )
            .toPromise();
        } else if (this.selectedLocation.lat && this.selectedLocation.lng) {
          response = await this.apiService
            .getGregorianDateRangeCalendar(
              startDate,
              endDate,
              this.selectedLocation.lng,
              this.selectedLocation.lat,
              undefined
            )
            .toPromise();
        }
      } else {
        // For Hijri dates, use the Hijri date range API
        startDate = this.datePickerValueToHijriDate(
          this.hijriDateRange.startDate!
        );
        endDate = this.datePickerValueToHijriDate(this.hijriDateRange.endDate!);

        if (this.selectedLocation.cityId) {
          response = await this.apiService
            .getHijriDateRangeCalendar(
              startDate,
              endDate,
              undefined,
              undefined,
              this.selectedLocation.cityId
            )
            .toPromise();
        } else if (this.selectedLocation.lat && this.selectedLocation.lng) {
          response = await this.apiService
            .getHijriDateRangeCalendar(
              startDate,
              endDate,
              this.selectedLocation.lng,
              this.selectedLocation.lat,
              undefined
            )
            .toPromise();
        }
      }

      if (response && response.success && response.data) {
        this.prayerTimes = response.data.days!;
      }
    } catch (error) {
      console.error('Error fetching date range prayer times:', error);
    } finally {
      this.loading = false;
    }
  }

  formatTime12(time: string | undefined): string {
    if (!time) return '--';

    // Handles HH:mm or HH:mm:ss
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const minute = m ? m.padStart(2, '0') : '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }
}
