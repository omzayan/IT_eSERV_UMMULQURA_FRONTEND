import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {  CitySelectorComponent } from '../../shared/city-selector/city-selector.component';
import {
  HijriMonthYearPickerComponent,
  HijriMonthYearValue,
} from '../../shared/unified-date-picker';
import { PrayerService } from '../../../core/services/prayer.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  BaseResponse,
  City,
  CommonResponse,
  MonthlyPrayerTimesResult,
  MonthPrayerTimes,
} from '../../../core/types/api.types';

interface LocationState {
  cityId?: number;
  lat?: number;
  lng?: number;
}

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
  selector: 'app-hijri-monthly-prayer-times',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CitySelectorComponent,
    HijriMonthYearPickerComponent,
  ],
  template: `
    <div
      class="p-4 md:p-[80px] flex flex-col gap-6 bg-[#F9FAFB]"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <div class="flex gap-3 w-full">
        <div class="w-1/2">
          <app-hijri-month-year-picker
            [value]="selectedMonthYear"
            (valueChange)="handleMonthYearSelect($event)"
          ></app-hijri-month-year-picker>
        </div>
        <div class="w-1/2">
          <app-city-selector
            [label]="'citySelect.selectCity'"
            (citySelect)="handleCitySelect($event)"
            (locationSelect)="handleLocationSelect($event)"
          ></app-city-selector>
        </div>
      </div>

      <!-- Error Message -->
      <div
        *ngIf="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-ibm-plex-arabic"
      >
        {{ error }}
      </div>

      <div class="flex w-full">
        <button
          (click)="fetchHijriMonthlyData()"
          [disabled]="
            loading ||
            selectedMonthYear === null ||
            (!selectedLocation.cityId &&
              !(selectedLocation.lat && selectedLocation.lng))
          "
          class="bg-[#1B8354] py-2 rounded text-white w-full font-medium hover:bg-[#156841] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-ibm-plex-arabic"
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
        *ngIf="prayerTimes?.daily_prayer_times"
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
                  *ngFor="
                    let row of prayerTimes?.daily_prayer_times;
                    let i = index
                  "
                  class="font-ibm-plex-arabic"
                  [class]="i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'"
                >
               <td class="text-[#384250] p-4 whitespace-nowrap">
 {{ row.gregorian_date.day_name || '--' }}
</td>
<td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
  {{ row.hijri_date.day }} {{ row.hijri_date.month_name }} {{ row.hijri_date.year }}
</td>
<td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
  {{ row.gregorian_date.day }} {{ row.gregorian_date.month_name }} {{ row.gregorian_date.year }}
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
export class HijriMonthlyPrayerTimesComponent implements OnInit, OnDestroy {
  selectedMonthYear: HijriMonthYearValue | null = null;
  selectedLocation: LocationState = {};
  prayerTimes: MonthlyPrayerTimesResult | null = null;
  loading = false;
  error: string | null = null;
  isAr = false;

  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
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

handleLocationSelect(location: { lat?: number | null; lng?: number | null }): void {
  this.selectedLocation = {
    lat: location.lat ?? undefined,
    lng: location.lng ?? undefined,
    cityId: undefined,
  };

  this.error = null;
}


handleCitySelect(city: City): void {
  this.selectedLocation = {
    lat: city.latitude,
    lng: city.longitude,
    cityId: city.id,
    
  };
}



  handleMonthYearSelect(value: HijriMonthYearValue | null): void {
    this.selectedMonthYear = value;
    // Clear error when user makes a selection
    if (this.error) this.error = null;
  }

 async fetchHijriMonthlyData(): Promise<void> {
  if (
    this.selectedMonthYear === null ||
    (!this.selectedLocation.cityId &&
      !(this.selectedLocation.lat && this.selectedLocation.lng))
  ) {
    this.error = this.translate.instant('errors.missingRequiredFields');
    return;
  }

  try {
    this.loading = true;
    this.error = null;

    const { year, month } = this.selectedMonthYear;
    const latitude = this.selectedLocation.lat;
    const longitude = this.selectedLocation.lng;

    const response = await this.prayerService
      .getMonthlyPrayerTimesByHijri(year, month, longitude, latitude)
      .toPromise();

  if (response && response.success && response.result) {
  this.prayerTimes = {
    days_in_month: response.result.prayerTimes.length,
    location: { /* حط بيانات الموقع هنا */ },
    daily_prayer_times: response.result.prayerTimes.map(pt => ({
      hijri_date: pt.hijri_date,
      gregorian_date: pt.gregorian_date,
      day_name: '', // لو API بيرجعها ضيفها
      prayer_times: {
        fajr: pt.fajr,
        sunrise: pt.sunrise,
        dhuhr: pt.dhuhr,
        asr: pt.asr,
        maghrib: pt.maghrib,
        isha: pt.isha,
        sunset: pt.sunset
      }
    }))
  };
}
else {
      this.error = this.translate.instant('errors.failedToLoadPrayerTimes');
    }
  } catch (err) {
    console.error('Error fetching Hijri monthly prayer times:', err);
    this.error = this.translate.instant('errors.failedToLoadPrayerTimes');
  } finally {
    this.loading = false;
  }
}


  formatTime12(time: string | undefined): string {
    if (!time || time === '--') return '--';

    const [h, m] = time.split(':');
    if (h === undefined || m === undefined) return time;

    let hour = parseInt(h, 10);
    const minute = m;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }
}
