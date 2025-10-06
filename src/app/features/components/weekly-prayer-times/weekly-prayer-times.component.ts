import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CityData, CitySelectorComponent } from '../../shared/city-selector/city-selector.component';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
} from '../../shared/unified-date-picker/unified-date-picker.component';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';
import { City, DailyPrayerTime } from '../../../core/types/api.types';

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
        <h3 class="text-lg font-medium text-[#384250] mb-4 font-ibm-plex-arabic">
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
      <div *ngIf="selectedDateRangeType === 'gregorian'"
           class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 class="text-md font-medium text-[#384250] mb-4 font-ibm-plex-arabic">
          {{ 'prayTimeTable.headers.gregorian' | translate }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-unified-date-picker
            type="gregorian"
            [value]="gregorianDateRange.startDate"
            (valueChange)="handleGregorianStartDateChange($event)"
            [placeholder]="'startDate' | translate"
            [label]="'startDate' | translate">
          </app-unified-date-picker>

          <app-unified-date-picker
            type="gregorian"
            [value]="gregorianDateRange.endDate"
            (valueChange)="handleGregorianEndDateChange($event)"
            [placeholder]="'endDate' | translate"
            [label]="'endDate' | translate">
          </app-unified-date-picker>
        </div>
      </div>

      <!-- Hijri Date Range -->
      <div *ngIf="selectedDateRangeType === 'hijri'"
           class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 class="text-md font-medium text-[#384250] mb-4 font-ibm-plex-arabic">
          {{ 'prayTimeTable.headers.hijri' | translate }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-unified-date-picker
            type="hijri"
            [value]="hijriDateRange.startDate"
            (valueChange)="handleHijriStartDateChange($event)"
            [placeholder]="'startDate' | translate"
            [label]="'startDate' | translate">
          </app-unified-date-picker>

          <app-unified-date-picker
            type="hijri"
            [value]="hijriDateRange.endDate"
            (valueChange)="handleHijriEndDateChange($event)"
            [placeholder]="'endDate' | translate"
            [label]="'endDate' | translate">
          </app-unified-date-picker>
        </div>
      </div>

      <!-- Location Selection -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <app-city-selector
          [label]="'citySelect.selectCity'"
          (citySelect)="handleCitySelect($event)"
          (locationSelect)="handleLocationSelect($event)">
        </app-city-selector>
      </div>

      <!-- Fetch Button -->
      <div class="flex w-full">
        <button (click)="fetchDateRangeData()"
                [disabled]="!isFormValid() || loading"
                class="bg-[#1B8354] py-3 px-6 rounded text-white w-full font-medium hover:bg-[#156841] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-ibm-plex-arabic">
          {{ loading ? ('common.loading' | translate) : ('prayTimeTable.showPrayerTimes' | translate) }}
        </button>
      </div>

      <!-- Prayer Times Table -->
      <div *ngIf="prayerTimes.length > 0"
           class="flex flex-col w-full rounded-2xl border border-[#D2D6DB] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th *ngFor="let header of ['dayName','hijriDate','gregorianDate','fajr','sunrise','dhuhr','asr','maghrib','isha']"
                    class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] whitespace-nowrap border-s first:border-s-0">
                  {{ ('prayTimeTable.headers.' + header | translate) || ('prayers.' + header | translate) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of prayerTimes"
                  class="font-ibm-plex-arabic bg-white border-b border-[#D2D6DB]">
                <td class="p-4">{{ row.day_name || '--' }}</td>
                <td class="p-4 border-s">{{ row.hijri_date.formatted || '--' }}</td>
                <td class="p-4 border-s">{{ row.gregorian_date.formatted || '--' }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.fajr) }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.sunrise) }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.dhuhr) }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.asr) }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.maghrib) }}</td>
                <td class="p-4 border-s">{{ formatTime12(row.prayer_times.isha) }}</td>
              </tr>
            </tbody>
          </table>
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

handleLocationSelect(location: { lat?: number; lng?: number }): void {
  this.selectedLocation = {
    lat: location.lat ?? undefined,
    lng: location.lng ?? undefined,
    cityId: undefined,
  };

 
}



handleCitySelect(city: City): void {
  this.selectedLocation = {
    lat: city.latitude,
    lng: city.longitude,
    cityId: city.id,
    
  };
}


  isFormValid(): boolean {
    const hasLocation =
      !!this.selectedLocation.cityId || !!(this.selectedLocation.lat && this.selectedLocation.lng);

    if (this.selectedDateRangeType === 'gregorian') {
      return hasLocation && !!this.gregorianDateRange.startDate && !!this.gregorianDateRange.endDate;
    } else {
      return hasLocation && !!this.hijriDateRange.startDate && !!this.hijriDateRange.endDate;
    }
  }

  private datePickerValueToGregorianDate(dateValue: DatePickerValue): Date {
    return new Date(dateValue.year, dateValue.month - 1, dateValue.dayNumber);
  }

  private datePickerValueToHijriDate(dateValue: DatePickerValue): Date {
    return new Date(dateValue.year, dateValue.month - 1, dateValue.dayNumber);
  }

  async fetchDateRangeData(): Promise<void> {
    try {
      this.loading = true;
      if (!this.isFormValid()) return;

      let startDate: Date;
      let endDate: Date;
      let response;

      if (this.selectedDateRangeType === 'gregorian') {
        startDate = this.datePickerValueToGregorianDate(this.gregorianDateRange.startDate!);
        endDate = this.datePickerValueToGregorianDate(this.gregorianDateRange.endDate!);

        if (this.selectedLocation.cityId) {
          response = await this.apiService
            .getGregorianDateRangeCalendar(startDate, endDate, undefined, undefined, this.selectedLocation.cityId)
            .toPromise();
        } else if (this.selectedLocation.lat && this.selectedLocation.lng) {
          response = await this.apiService
            .getGregorianDateRangeCalendar(startDate, endDate, this.selectedLocation.lng, this.selectedLocation.lat, undefined)
            .toPromise();
        }
      } else {
        startDate = this.datePickerValueToHijriDate(this.hijriDateRange.startDate!);
        endDate = this.datePickerValueToHijriDate(this.hijriDateRange.endDate!);

        if (this.selectedLocation.cityId) {
          response = await this.apiService
            .getHijriDateRangeCalendar(startDate, endDate, undefined, undefined, this.selectedLocation.cityId)
            .toPromise();
        } else if (this.selectedLocation.lat && this.selectedLocation.lng) {
          response = await this.apiService
            .getHijriDateRangeCalendar(startDate, endDate, this.selectedLocation.lng, this.selectedLocation.lat, undefined)
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
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const minute = m ? m.padStart(2, '0') : '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }
}
