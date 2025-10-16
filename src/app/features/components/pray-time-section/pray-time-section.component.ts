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
import { interval, Subscription, Subject, takeUntil } from 'rxjs';
import {
  PrayerService,
  ReferenceDataService,
  LanguageService,
  GeolocationService,
} from '../../../core/services';
import {
  PrayerTimeWithDateResult,
  CityResult,
  City,
} from '../../../core/types/api.types';
import {
  CitySelectorComponent,
  LocationData,
} from '../../shared/city-selector/city-selector.component';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
} from '../../shared/unified-date-picker/unified-date-picker.component';

interface PrayerCardMeta {
  key: string;
  name: string;
  bg: string;
}

@Component({
  selector: 'app-pray-time-section',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    CitySelectorComponent,
    UnifiedDatePickerComponent,
  ],
  template: `
    <div class="flex flex-col gap-8 px-4 py-16 md:px-20 md:py-20" [style.direction]="isAr ? 'rtl' : 'ltr'">

      <!-- Header -->
      <div class="flex flex-col gap-5">
        <div class="flex justify-between items-center">
          <span class="text-[30px] md:text-[36px] font-bold text-[#161616] font-ibm-plex-arabic">
            {{ 'prayTimeSection.title' | translate }}
          </span>
        </div>
        <span class="text-[16px] md:text-[18px] leading-relaxed text-[#161616] font-ibm-plex-arabic">
          {{ 'prayTimeSection.description' | translate }}
        </span>

        <!-- Date & City Selection -->
        <div class="flex flex-col gap-4 max-w-4xl">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <app-unified-date-picker
                #hijriDatePicker
                type="hijri"
                [label]="'prayTimeSection.hijriDate'"
                [value]="selectedHijriDate"
                (valueChange)="onHijriDateChange($event)">
              </app-unified-date-picker>
            </div>
            <div class="flex-1">
              <app-unified-date-picker
                #gregorianDatePicker
                type="gregorian"
                [label]="'prayTimeSection.gregorianDate'"
                [value]="selectedGregorianDate"
                (valueChange)="onGregorianDateChange($event)">
              </app-unified-date-picker>
            </div>
          </div>
          <!-- Date Validation -->
          <div *ngIf="showDateError" class="flex items-center gap-2 text-red-600 text-sm mt-1 font-ibm-plex-arabic">
            ⚠️ برجاء اختيار التاريخ
          </div>

          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1">
              <app-city-selector
                #citySelector
                [label]="'prayTimeSection.selectCity'"
                (citySelect)="onCitySelect($event)"
                (locationSelect)="onLocationSelect($event)">
              </app-city-selector>
            </div>
            <button
              class="bg-[#092A1E] hover:bg-[#0a2f20] text-white px-6 py-2 rounded-lg font-ibm-plex-arabic"
              (click)="handleSearch()"
              [disabled]="loading">
              {{
                loading
                  ? ('prayTimeSection.loading' | translate)
                  : ('prayTimeSection.search' | translate)
              }}
            </button>
          </div>
          <!-- City Validation -->
          <div *ngIf="showCityError" class="flex items-center gap-2 text-red-600 text-sm mt-1 font-ibm-plex-arabic">
            ⚠️ برجاء اختيار المدينة
          </div>
        </div>

        <div *ngIf="error" class="text-red-500 font-ibm-plex-arabic">
          {{ error }}
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div *ngFor="let meta of prayerCardMeta; let i = index"
          class="prayer-card relative rounded-lg overflow-hidden h-[308px]"
          [style.background-image]="'url(' + meta.bg + ')'"
          [style.background-size]="'cover'"
          [style.background-position]="'center'">

          <div class="absolute inset-0 bg-black bg-opacity-40"></div>

          <div class="relative z-10 h-full flex flex-col justify-between px-4 pt-[40px] pb-6 text-white">
            <div>
              <h3 class="text-2xl font-bold mb-1 font-ibm-plex-arabic">{{ meta.name | translate }}</h3>
              <p class="text-base font-bold text-black bg-white w-fit rounded px-2 font-ibm-plex-arabic">
                {{ formatTo12Hour(getPrayerTime(meta.key)) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrayTimeSectionComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();

  // ✅ Validation flags
  showDateError = false;
  showCityError = false;

  prayerCardMeta: PrayerCardMeta[] = [
    { key: 'fajr', name: 'prayers.fajr', bg: 'assets/images/fajr-time.png' },
    { key: 'sunrise', name: 'prayers.sunrise', bg: 'assets/images/sunrise-time.png' },
    { key: 'dhuhr', name: 'prayers.dhuhr', bg: 'assets/images/dhuhr-time.png' },
    { key: 'asr', name: 'prayers.asr', bg: 'assets/images/asr-time.png' },
    { key: 'maghrib', name: 'prayers.maghrib', bg: 'assets/images/maghrib-time.png' },
    { key: 'isha', name: 'prayers.isha', bg: 'assets/images/isha-time.png' },
  ];

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private languageService: LanguageService,
    private referenceDataService: ReferenceDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  // اللغة
  this.languageService.currentLanguage$
    .pipe(takeUntil(this.destroy$))
    .subscribe(lang => this.isAr = lang === 'ar');

  // ✅ set default city Riyadh
  this.selectedCoords = { lat: 24.7136, lng: 46.6753 };
  this.selectedCityId = null; // أو ID الرياض لو متوفر عندك من الـ backend

  // ✅ set default Gregorian date = today
  const today = new Date();
  this.selectedGregorianDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    dayNumber: today.getDate()
  };

  // ✅ call API مباشرة
  this.handleSearch();
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    const lat = (city as any).lat ?? (city as any).latitude;
    const lng = (city as any).lng ?? (city as any).longitude;
    if (lat && lng) {
      this.selectedCoords = { lat, lng };
      this.selectedCityId = city.id;
    }
  }

  onLocationSelect(location: LocationData): void {
    this.selectedCoords = location;
    this.selectedCityId = null;
  }

  handleSearch(): void {
    this.loading = true;
    this.error = null;

    // ✅ Validate city
    if (!this.selectedCoords) {
      this.showCityError = true;
      this.loading = false;
      return;
    } else {
      this.showCityError = false;
    }

    // ✅ Validate date
    if (!this.selectedHijriDate && !this.selectedGregorianDate) {
      this.showDateError = true;
      this.loading = false;
      return;
    } else {
      this.showDateError = false;
    }

    // ✅ Decide which API to call
    if (this.selectedHijriDate) {
      this.handleHijriDateSearch();
    } else if (this.selectedGregorianDate) {
      this.handleGregorianDateSearch();
    }
  }

  private handleHijriDateSearch(): void {
    if (!this.selectedHijriDate || !this.selectedCoords) return;
    const { year, month, dayNumber } = this.selectedHijriDate;

    this.prayerService.getPrayerTimesForHijriDate(
      year, month, dayNumber,
      this.selectedCoords.lng?? undefined, this.selectedCoords.lat??undefined
    ).subscribe({
      next: (res) => { this.prayerTime = res; this.loading = false; },
      error: () => { this.error = 'خطأ في جلب البيانات'; this.loading = false; }
    });
  }

  private handleGregorianDateSearch(): void {
    if (!this.selectedGregorianDate || !this.selectedCoords) return;
    const d = this.selectedGregorianDate;
    const gregorianDate = new Date(d.year, d.month - 1, d.dayNumber);

    this.prayerService.getPrayerTimesForGregorianDate(
      gregorianDate, this.selectedCoords.lng??undefined, this.selectedCoords.lat??undefined
    ).subscribe({
      next: (res) => { this.prayerTime = res; this.loading = false; },
      error: () => { this.error = 'خطأ في جلب البيانات'; this.loading = false; }
    });
  }

  getPrayerTime(key: string): string {
    if (!this.prayerTime?.prayer_times) return '--';
    return (this.prayerTime.prayer_times as any)[key] || '--';
  }

  formatTo12Hour(time: string): string {
    if (!time || time === '--') return '--';
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }
}
