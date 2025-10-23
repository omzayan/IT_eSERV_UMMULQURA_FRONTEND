import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  PrayerService,
  LanguageService,
  GeolocationService,
} from '../../../core/services';
import {
  City,
  PrayerTimeWithDateResult,
} from '../../../core/types/api.types';
import {
  CitySelectorComponent,
  LocationData,
} from '../../shared/city-selector/city-selector.component';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
} from '../../shared/unified-date-picker/unified-date-picker.component';

@Component({
  selector: 'app-daily-prayer-times',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    CitySelectorComponent,
    UnifiedDatePickerComponent,
  ],
  template: `
    <div class="p-4 md:p-[80px] flex flex-col gap-6 bg-[#F9FAFB]">
      <!-- Date and Location Selection Section -->
      <div class="flex flex-col gap-4 ">
      <div class="flex flex-col md:flex-row gap-4 items-center">
  <!-- Hijri Date -->
  <div class="flex-1">
    <app-unified-date-picker
      #hijriDatePicker
      type="hijri"
      [label]="'prayTimeSection.hijriDate'"
      [value]="selectedHijriDate"
      (valueChange)="onHijriDateChange($event)"
    ></app-unified-date-picker>
  </div>

  <!-- Gregorian Date -->
  <div class="flex-1">
    <app-unified-date-picker
      #gregorianDatePicker
      type="gregorian"
      [label]="'prayTimeSection.gregorianDate'"
      [value]="selectedGregorianDate"
      (valueChange)="onGregorianDateChange($event)"
    ></app-unified-date-picker>
  </div>

  <!-- City -->
  <div class="flex-1">
    <app-city-selector
      #citySelector
      [label]="'prayTimeSection.selectCity'"
      (citySelect)="onCitySelect($event)"
      (locationSelect)="onLocationSelect($event)"
    ></app-city-selector>
  </div>
</div>

 


        <!-- Search Button -->
        <button
          class="bg-[#1B8354] hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium font-ibm-plex-arabic"
          (click)="handleSearch()"
          [disabled]="loading"
        >
          {{
            loading
              ? ('prayTimeSection.loading' | translate)
              : ('prayTimeSection.search' | translate)
          }}
        </button>
      </div>

      <!-- Error Message عام -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-ibm-plex-arabic">
        {{ error }}
      </div>

      <!-- Prayer Times Table -->
      <div *ngIf="prayerTime" class="flex flex-col w-full rounded-2xl border border-[#D2D6DB] overflow-hidden">
        <div class="overflow-x-auto">
          <div class="min-w-max">
            <table class="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayTimeTable.headers.dayName' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayTimeTable.headers.hijriDate' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayTimeTable.headers.gregorianDate' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.fajr' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.sunrise' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.dhuhr' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.asr' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.maghrib' | translate }}
                  </th>
                  <th class="text-[#384250] bg-[#F3F4F6] p-4 text-start border-b border-[#D2D6DB] whitespace-nowrap">
                    {{ 'prayers.isha' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-white">
                  <td class="p-4 whitespace-nowrap">
                    {{ prayerTime.day_name || '--' }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ prayerTime.hijri_date.day }} {{ prayerTime.hijri_date.month_name }} {{ prayerTime.hijri_date.year }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ prayerTime.gregorian_date.day }} {{ prayerTime.gregorian_date.month_name }} {{ prayerTime.gregorian_date.year }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.fajr) }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.sunrise) }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.dhuhr) }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.asr) }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.maghrib) }}
                  </td>
                  <td class="p-4 border-s border-[#D2D6DB] whitespace-nowrap">
                    {{ formatTime12(prayerTime.prayer_times.isha) }}
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
export class DailyPrayerTimesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('citySelector') citySelector!: CitySelectorComponent;
  @ViewChild('hijriDatePicker') hijriDatePicker!: UnifiedDatePickerComponent;
  @ViewChild('gregorianDatePicker') gregorianDatePicker!: UnifiedDatePickerComponent;

  isAr = false;
  selectedCityId: number | null = null;
  selectedCoords: LocationData | null = null;
  selectedHijriDate: DatePickerValue | null = null;
  selectedGregorianDate: DatePickerValue | null = null;
  prayerTime: PrayerTimeWithDateResult | null = null;
  loading = false;
  error: string | null = null;

  showDateError = false;
  showCityError = false;

  private viewInitialized = false;
  private pendingDateUpdate: DatePickerValue | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private languageService: LanguageService,
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef
  ) { }

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

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.pendingDateUpdate) {
      this.selectedGregorianDate = this.pendingDateUpdate;
      this.pendingDateUpdate = null;
      this.cdr.detectChanges();
    }
    this.setDefaultUmmAlQura();
  }

  handleSearch(): void {
    this.loading = true;
    this.error = null;

    this.showDateError = false;
    this.showCityError = false;

    if (!this.selectedHijriDate && !this.selectedGregorianDate) {
      this.showDateError = true;
      this.loading = false;
      return;
    }

    if (!this.selectedCoords) {
      this.showCityError = true;
      this.loading = false;
      return;
    }

    if (this.selectedHijriDate) {
      this.handleHijriDateSearch();
    } else if (this.selectedGregorianDate) {
      this.handleGregorianDateSearch();
    }
  }

  private handleHijriDateSearch(): void {
    if (this.selectedHijriDate && this.selectedCoords) {
      const { year, month, dayNumber } = this.selectedHijriDate;
      this.prayerService
        .getPrayerTimesForHijriDate(
          year,
          month,
          dayNumber,
          this.selectedCoords?.lng ?? undefined,
          this.selectedCoords?.lat ?? undefined
        )
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: () => this.handleSearchError(),
        });
    }
  }

  private handleGregorianDateSearch(): void {
    if (this.selectedGregorianDate && this.selectedCoords) {
      const { year, month, dayNumber } = this.selectedGregorianDate;
      const gregorianDate = new Date(year, month - 1, dayNumber);

      this.prayerService
        .getPrayerTimesForGregorianDate(
          gregorianDate,
          this.selectedCoords?.lng ?? undefined,
          this.selectedCoords?.lat ?? undefined
        )
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: () => this.handleSearchError(),
        });
    }
  }

  private handleSearchError(): void {
    this.error =
      this.translate.instant('prayTimeSection.error') ||
      'Error fetching prayer times';
    this.loading = false;
  }

  onHijriDateChange(date: DatePickerValue | null): void {
    this.selectedHijriDate = date;
    if (date) this.selectedGregorianDate = null;
  }

  onGregorianDateChange(date: DatePickerValue | null): void {
    this.selectedGregorianDate = date;
    if (date) this.selectedHijriDate = null;
  }

  onCitySelect(city: City): void {
    this.selectedCoords = { lat: city.latitude, lng: city.longitude };
    this.selectedCityId = city.id;
  }

  onLocationSelect(location: LocationData): void {
    this.selectedCoords = location;
    this.selectedCityId = null;
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

    // النصوص حسب اللغة
    let suffix = '';
    switch (currentLang) {
      case 'ar':
        suffix = isPM ? 'م' : 'ص';
        break;
      case 'fr':
        suffix = isPM ? 'PM' : 'AM'; // ممكن تعمل 'soir/matin'
        break;
      case 'ch':
        suffix = isPM ? '下午' : '上午';
        break;
      case 'BN':
        suffix = isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
        break;
      case 'tu':
        suffix = isPM ? 'ÖS' : 'ÖÖ'; // مثال للتركية
        break;
      default:
        suffix = isPM ? 'PM' : 'AM'; // الإنجليزية أو الافتراضي
    }

    return `${hour}:${minute} ${suffix}`;
  }
  
  private setDefaultUmmAlQura(): void {
    const makkahCoords: LocationData = {
      lat: 21.42,
      lng: 39.83,
    };
    this.selectedCoords = makkahCoords;

    const today = new Date();
    const defaultDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      dayNumber: today.getDate(),
    };

    Promise.resolve().then(() => {
      this.selectedGregorianDate = defaultDate;
      this.handleSearch();
    });
  }

}
