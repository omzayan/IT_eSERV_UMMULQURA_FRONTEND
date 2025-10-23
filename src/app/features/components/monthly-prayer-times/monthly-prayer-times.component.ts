import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CitySelectorComponent } from '../../shared/city-selector/city-selector.component';
import {
  GregorianMonthYearPickerComponent,
  GregorianMonthYearValue,
} from '../../shared/unified-date-picker';
import { PrayerService } from '../../../core/services/prayer.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  City,
  MonthlyPrayerTimesResult,
} from '../../../core/types/api.types';

interface LocationState {
  cityId?: number;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'app-monthly-prayer-times',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CitySelectorComponent,
    GregorianMonthYearPickerComponent,
  ],
  template: `
    <div
      class="p-4 md:p-[80px] flex flex-col gap-6 bg-[#F9FAFB]"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <!-- Month/Year & City -->
      <div class="flex gap-3 w-full">
     <div class="w-1/2">
  <app-gregorian-month-year-picker
    [value]="selectedMonthYear"
    (valueChange)="handleMonthYearSelect($event)"
    
  ></app-gregorian-month-year-picker>
</div>
<div class="w-1/2">
  <app-city-selector
    [label]="'citySelect.selectCity' | translate"
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

      <!-- Fetch Button -->
      <div class="flex w-full">
        <button
          (click)="fetchMonthlyData()"
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
        *ngIf="prayerTimes?.daily_prayer_times?.length! > 0"
        class="flex flex-col w-full rounded-2xl border border-[#D2D6DB] overflow-hidden"
      >
        <div class="overflow-x-auto">
          <div class="min-w-max">
            <table class="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th *ngFor="let header of tableHeaders"
                      class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] whitespace-nowrap border-s first:border-s-0">
                    {{ header | translate }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let row of prayerTimes?.daily_prayer_times; let i = index"
                  class="font-ibm-plex-arabic"
                  [class]="i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'"
                >
                  <td class="text-[#384250] p-4 whitespace-nowrap">
                    {{ row.day_name || '--' }}
                  </td>
  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
  {{ row.hijri_date.day }} {{ row.hijri_date.month_name }} {{ row.hijri_date.year }}
</td>
<td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
  {{ row.gregorian_date.day }} {{ row.gregorian_date.month_name }} {{ row.gregorian_date.year }}
</td>

                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(row.prayer_times.fajr) }}
                  </td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(row.prayer_times.sunrise) }}
                  </td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(row.prayer_times.dhuhr) }}
                  </td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(row.prayer_times.asr) }}
                  </td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(row.prayer_times.maghrib) }}
                  </td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
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
export class MonthlyPrayerTimesComponent implements OnInit, OnDestroy {
  selectedMonthYear: GregorianMonthYearValue | null = null;
  selectedLocation: LocationState = {};
  prayerTimes: MonthlyPrayerTimesResult | null = null;
  loading = false;
  error: string | null = null;
  isAr = false;

  tableHeaders = [
    'prayTimeTable.headers.dayName',
    'prayTimeTable.headers.hijriDate',
    'prayTimeTable.headers.gregorianDate',
    'prayers.fajr',
    'prayers.sunrise',
    'prayers.dhuhr',
    'prayers.asr',
    'prayers.maghrib',
    'prayers.isha',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
      });
      this.setDefaultUmmAlQura();
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
   this.tryAutoFetch();
}


  handleCitySelect(city: City): void {
    this.selectedLocation = {
      lat: city.latitude,
      lng: city.longitude,
      cityId: city.id,
    };
    if (this.error) this.error = null;
    this.tryAutoFetch();
  }

  handleMonthYearSelect(value: GregorianMonthYearValue | null): void {
    this.selectedMonthYear = value;
    if (this.error) this.error = null;
    this.tryAutoFetch();
  }

  private tryAutoFetch(): void {
    // بمجرد اختيار الشهر + المدينة يبدأ يجلب الداتا أوتوماتيك
    if (
      this.selectedMonthYear &&
      (this.selectedLocation.cityId ||
        (this.selectedLocation.lat && this.selectedLocation.lng))
    ) {
      this.fetchMonthlyData();
    }
  }

  async fetchMonthlyData(): Promise<void> {
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
      const latitude = this.selectedLocation.lat ?? 21.42;
      const longitude = this.selectedLocation.lng ?? 39.83;
      const cityId = this.selectedLocation.cityId;

      const response = await this.prayerService
        .getMonthlyPrayerTimesByGregorian(year, month, longitude, latitude)
        .toPromise();
        // console.log("res",response);

      if (response && response.success && response.result) {
        this.prayerTimes = {
          days_in_month: response.result.prayerTimes.length,
          location: {
            city_id: cityId ?? null,
            latitude,
            longitude,
          },
          daily_prayer_times: response.result.prayerTimes.map((pt) => ({
            hijri_date: pt.hijri_date,
            gregorian_date: pt.gregorian_date,
            day_name: pt.gregorian_date?.day_name ?? '',
            prayer_times: {
              fajr: pt.fajr,
              sunrise: pt.sunrise,
              dhuhr: pt.dhuhr,
              asr: pt.asr,
              maghrib: pt.maghrib,
              isha: pt.isha,
              sunset: pt.sunset,
            },
          })),
        };
      } else {
        this.error = this.translate.instant('errors.failedToLoadPrayerTimes');
      }
    } catch (err) {
      console.error('Error fetching monthly prayer times:', err);
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
  const minute = m.padStart(2, '0');
  const isPM = hour >= 12;

  hour = hour % 12;
  if (hour === 0) hour = 12;

  // اللغة الحالية
  const currentLang = this.translate.currentLang || 'en';

  // تحديد النص حسب اللغة
  let suffix = '';
  switch (currentLang) {
    case 'ar':
      suffix = isPM ? 'م' : 'ص';
      break;
    case 'fr':
      suffix = isPM ? 'PM' : 'AM'; // ممكن تعمل Matin/Soir
      break;
    case 'ch':
      suffix = isPM ? '下午' : '上午';
      break;
    case 'BN':
      suffix = isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
      break;
    case 'tu':
      suffix = isPM ? 'ÖS' : 'ÖÖ';
      break;
    default:
      suffix = isPM ? 'PM' : 'AM'; // الافتراضي
  }

  return `${hour}:${minute} ${suffix}`;
}

private setDefaultUmmAlQura(): void {
  const today = new Date();

  const month = today.getMonth() + 1; 
  const year = today.getFullYear();

  Promise.resolve().then(() => {
    this.selectedMonthYear = { year, month };
    this.selectedLocation = { lat: 21.42, lng: 39.83 };

    this.tryAutoFetch();
  });
}


}
