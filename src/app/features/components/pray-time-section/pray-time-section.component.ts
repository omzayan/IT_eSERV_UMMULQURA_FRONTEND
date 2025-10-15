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
    <div
      class="flex flex-col gap-8 px-4 py-16 md:px-20 md:py-20"
      [style.direction]="isAr ? 'rtl' : 'ltr'"
    >
      <div class="flex flex-col gap-8">
        <!-- Header Section -->
        <div class="flex flex-col gap-5">
          <div class="flex justify-between items-center">
            <span
              class="text-[30px] md:text-[36px] text-[#161616] font-bold font-ibm-plex-arabic"
            >
              {{ 'prayTimeSection.title' | translate }}
            </span>
          </div>
          <span
            class="text-[16px] md:text-[18px] text-[#161616] leading-relaxed font-ibm-plex-arabic"
          >
            {{ 'prayTimeSection.description' | translate }}
          </span>

          <!-- Date and Location Selection Section -->
          <div class="flex flex-col gap-4 max-w-4xl">
            <!-- Date Pickers Row -->
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <app-unified-date-picker
                  #hijriDatePicker
                  type="hijri"
                  [label]="'prayTimeSection.hijriDate'"
                  [value]="selectedHijriDate"
                  (valueChange)="onHijriDateChange($event)"
                ></app-unified-date-picker>
              </div>
              <div class="flex-1">
                <app-unified-date-picker
                  #gregorianDatePicker
                  type="gregorian"
                  [label]="'prayTimeSection.gregorianDate'"
                  [value]="selectedGregorianDate"
                  (valueChange)="onGregorianDateChange($event)"
                ></app-unified-date-picker>
              </div>
            </div>

            <!-- Location Selection Row -->
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <div class="flex-1">
                <app-city-selector
                  #citySelector
                  [label]="'prayTimeSection.selectCity'"
                  (citySelect)="onCitySelect($event)"
                  (locationSelect)="onLocationSelect($event)"
                ></app-city-selector>
              </div>
              <button
                class="bg-[#092A1E] hover:bg-[#0a2f20] text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium font-ibm-plex-arabic"
                (click)="handleSearch()"
                [disabled]="loading || !selectedCoords"
              >
                {{
                  loading
                    ? ('prayTimeSection.loading' | translate)
                    : ('prayTimeSection.search' | translate)
                }}
              </button>
            </div>
          </div>

          <div *ngIf="error" class="text-red-500 font-ibm-plex-arabic">
            {{ error }}
          </div>
        </div>

        <!-- Prayer Cards Grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 "
        >
          <div
            *ngFor="let meta of prayerCardMeta; let i = index"
            class="prayer-card relative rounded-lg overflow-hidden h-[308px]  cursor-pointer transform hover:scale-105 transition-transform duration-300"
            [style.background-image]="'url(' + meta.bg + ')'"
            [style.background-size]="'cover'"
            [style.background-position]="'center'"
          >
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-40 "></div>

            <!-- Content -->
            <div
              class="relative z-10 h-full flex flex-col justify-between px-4 pt-[40px] pb-6 text-white"
            >
              <div class="flex flex-col">
                <h3 class="text-2xl font-bold font-ibm-plex-arabic mb-1">
                  {{ meta.name | translate }}
                </h3>
                <p
                  class="text-base font-bold font-ibm-plex-arabic text-black bg-white w-fit h-fit rounded px-2"
                  *ngIf="!isCurrentPrayer(i)"
                >
                  {{ formatTo12Hour(getPrayerTime(meta.key)) }}
                </p>
              </div>

              <!-- Current Prayer Circular Display -->
              <div
                *ngIf="isCurrentPrayer(i) && shouldShowTimeFeatures()"
                class="flex flex-col items-center justify-center flex-1"
              >
                <div class="circular-countdown relative">
                  <svg
                    class="countdown-circle"
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                  >
                    <!-- Background circle - full green dashes -->
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      fill="transparent"
                      stroke="#1B8354"
                      stroke-width="5"
                      stroke-miterlimit="2.3662"
                      stroke-dasharray="3 8"
                    ></circle>

                    <!-- White overlay that reveals remaining time -->
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      fill="transparent"
                      stroke="white"
                      stroke-width="5"
                      stroke-miterlimit="2.3662"
                      stroke-dasharray="3 8"
                      [style.stroke-dashoffset]="
                        (getProgressPercent(meta.key, i) / 100) * 502.4
                      "
                      class="countdown-progress"
                    ></circle>
                  </svg>
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div
                      class="text-3xl font-bold font-ibm-plex-arabic text-white mb-2"
                    >
                      {{ getTimeRemaining(meta.key, i) }}
                    </div>
                    <div
                      class="text-sm font-ibm-plex-arabic text-white opacity-80"
                    >
                      {{ 'prayTimeSection.remaining' | translate }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback for current prayer when time features are disabled -->
              <div
                *ngIf="isCurrentPrayer(i) && !shouldShowTimeFeatures()"
                class="flex flex-col items-center justify-center flex-1"
              >
                <div class="text-center">
                  <div
                    class="text-2xl font-bold font-ibm-plex-arabic text-white mb-2"
                  >
                    {{ 'prayCard.currentPrayer' | translate }}
                  </div>
                  <div
                    class="text-sm font-ibm-plex-arabic text-white opacity-80"
                  >
                    {{ 'prayCard.selectedDate' | translate }}
                  </div>
                </div>
              </div>

              <!-- Normal Prayer Card Content -->
              <div class="flex flex-col gap-6" *ngIf="!isCurrentPrayer(i)">
                <!-- Time-related features (only show for today/tomorrow, not custom dates) -->
                <div class="flex flex-col" *ngIf="shouldShowTimeFeatures()">
                  <div class="flex justify-between items-center">
                    <p class="text-sm font-ibm-plex-arabic ">
                      {{ 'prayTimeSection.remaining' | translate }}
                    </p>
                    <p class="text-sm font-bold font-ibm-plex-arabic">
                      {{ getTimeRemaining(meta.key, i) }}
                    </p>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-white  rounded-full h-2 ">
                    <div
                      class="bg-[#1B8354] rounded-full h-2 transition-all duration-300"
                      [style.width]="getProgressPercent(meta.key, i) + '%'"
                    ></div>
                  </div>
                </div>

                <!-- Fallback content for custom dates (when time features are hidden) -->
                <div
                  class="flex flex-col gap-4"
                  *ngIf="!shouldShowTimeFeatures()"
                >
                  <div class="text-center">
                    <p
                      class="text-sm font-ibm-plex-arabic text-white opacity-80"
                    >
                      {{ 'prayCard.selectedDate' | translate }}
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <button
                    class="w-full bg-[#FFFFFF] text-xs py-2 rounded text-[#1B8354] px-2"
                  >
                    {{ 'prayCard.nearestMosque' | translate }}
                  </button>
                  <button
                    class="w-full bg-[#1B8354] text-xs py-2 rounded text-white px-2"
                    (click)="scrollToQiblaCompass()"
                  >
                    {{ 'prayCard.qiblaDirection' | translate }}
                  </button>
                </div>
              </div>

              <!-- Current Prayer Buttons -->
              <div
                class="flex gap-4"
                *ngIf="isCurrentPrayer(i) && shouldShowTimeFeatures()"
              >
                <button
                  class="flex-1 bg-[#FFFFFF] text-xs py-2 rounded text-[#1B8354] font-ibm-plex-arabic px-2"
                >
                  {{ 'prayCard.nearestMosque' | translate }}
                </button>
                <button
                  class="flex-1 bg-[#1B8354] text-xs py-2 rounded text-white font-ibm-plex-arabic px-2"
                  (click)="scrollToQiblaCompass()"
                >
                  {{ 'prayCard.qiblaDirection' | translate }}
                </button>
              </div>

              <!-- Buttons for current prayer when time features are disabled -->
              <div
                class="flex gap-4"
                *ngIf="isCurrentPrayer(i) && !shouldShowTimeFeatures()"
              >
                <button
                  class="flex-1 bg-[#FFFFFF] text-xs py-2 rounded text-[#1B8354] font-ibm-plex-arabic px-2"
                >
                  {{ 'prayCard.nearestMosque' | translate }}
                </button>
                <button
                  class="flex-1 bg-[#1B8354] text-xs py-2 rounded text-white font-ibm-plex-arabic px-2"
                >
                  {{ 'prayCard.qiblaDirection' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .prayer-card {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      .circular-countdown {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .countdown-circle {
        transform: rotate(-90deg);
      }

      .countdown-progress {
        transition: stroke-dashoffset 1s ease-in-out;
      }
    `,
  ],
})
export class PrayTimeSectionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('citySelector') citySelector!: CitySelectorComponent;
  @ViewChild('hijriDatePicker') hijriDatePicker!: UnifiedDatePickerComponent;
  @ViewChild('gregorianDatePicker')
  gregorianDatePicker!: UnifiedDatePickerComponent;

  Math = Math;
  isAr = false;
  selectedCityId: number | null = null;
  selectedCoords: LocationData | null = null;
  selectedHijriDate: DatePickerValue | null = null;
  selectedGregorianDate: DatePickerValue | null = null;
  prayerTime: PrayerTimeWithDateResult | null = null;
  loading = false;
  error: string | null = null;
  now = new Date();
  isShowingTomorrowData = false;
  isShowingCustomDate = false;
  private viewInitialized = false;
  private pendingDateUpdate: DatePickerValue | null = null;
  private timeSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  prayerCardMeta: PrayerCardMeta[] = [];

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private languageService: LanguageService,
    private geolocationService: GeolocationService,
    private referenceDataService: ReferenceDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.updatePrayerNames();
      });

    this.timeSubscription = interval(60000).subscribe(() => {
      this.now = new Date();
    });

    this.updatePrayerNames();
    this.loadInitialPrayerTimes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeSubscription) this.timeSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.pendingDateUpdate) {
      this.selectedGregorianDate = this.pendingDateUpdate;
      this.pendingDateUpdate = null;
      this.cdr.detectChanges();
    }
  }

  private updatePrayerNames(): void {
    this.prayerCardMeta = [
      { key: 'fajr',    name: 'prayers.fajr',    bg: 'assets/images/fajr-time.png' },
      { key: 'sunrise', name: 'prayers.sunrise', bg: 'assets/images/sunrise-time.png' },
      { key: 'dhuhr',   name: 'prayers.dhuhr',   bg: 'assets/images/dhuhr-time.png' },
      { key: 'asr',     name: 'prayers.asr',     bg: 'assets/images/asr-time.png' },
      { key: 'maghrib', name: 'prayers.maghrib', bg: 'assets/images/maghrib-time.png' },
      { key: 'isha',    name: 'prayers.isha',    bg: 'assets/images/isha-time.png' },
    ];
  }

  private setInitialCoordinates(position: { latitude: number; longitude: number; }): void {
    this.selectedCoords = { lat: position.latitude, lng: position.longitude };
    this.selectedCityId = null;
  }

  private setDatePickerToToday(): void {
    const today = new Date();
    const todayDate = {
      dayNumber: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    };
    this.selectedHijriDate = null;
    this.isShowingTomorrowData = false;
    this.isShowingCustomDate = false;

    if (this.viewInitialized) {
      this.selectedGregorianDate = todayDate;
      this.cdr.detectChanges();
    } else {
      this.pendingDateUpdate = todayDate;
    }
  }

  private setDatePickerToTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = {
      dayNumber: tomorrow.getDate(),
      month: tomorrow.getMonth() + 1,
      year: tomorrow.getFullYear(),
    };
    this.selectedHijriDate = null;
    this.isShowingTomorrowData = true;
    this.isShowingCustomDate = false;

    if (this.viewInitialized) {
      this.selectedGregorianDate = tomorrowDate;
      this.cdr.detectChanges();
    } else {
      this.pendingDateUpdate = tomorrowDate;
    }
  }

  private handleInitialPrayerTimes(
    todayResult: PrayerTimeWithDateResult,
    position?: { latitude: number; longitude: number }
  ): void {
    const ishaTime = this.parsePrayerTimeToDate(todayResult.prayer_times?.isha || '');
    const currentTime = new Date();

    if (ishaTime && currentTime.getTime() > ishaTime.getTime()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const prayerObservable = position
        ? this.prayerService.getPrayerTimesForGregorianDate(
            tomorrow, position.longitude, position.latitude)
        : this.prayerService.getPrayerTimesForGregorianDate(tomorrow);

      prayerObservable.subscribe({
        next: (tomorrowResult) => {
          this.prayerTime = tomorrowResult;
          if (position) this.setInitialCoordinates(position);
          this.setDatePickerToTomorrow();
          this.loading = false;
        },
        error: () => {
          this.prayerTime = todayResult;
          if (position) this.setInitialCoordinates(position);
          this.loading = false;
        },
      });
    } else {
      this.prayerTime = todayResult;
      if (position) this.setInitialCoordinates(position);
      this.setDatePickerToToday();
      this.loading = false;
    }
  }

  private loadInitialPrayerTimes(): void {
    this.loading = true;
    this.error = null;

    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.prayerService
          .getTodayPrayerTimes(position.longitude, position.latitude)
          .subscribe({
            next: (result) => {
              if (result) this.handleInitialPrayerTimes(result, position);
              else this.loading = false;
            },
            error: () => {
              this.error = this.translate.instant('prayTimeSection.error') || 'Error fetching prayer times';
              this.loading = false;
            },
          });
      },
      error: () => {
        this.prayerService.getTodayPrayerTimes().subscribe({
          next: (result) => {
            if (result) this.handleInitialPrayerTimes(result);
            else this.loading = false;
          },
          error: () => { this.loading = false; },
        });
      },
    });
  }

  onHijriDateChange(date: DatePickerValue | null): void {
    this.selectedHijriDate = date;
    if (date) this.selectedGregorianDate = null;
    this.updateCustomDateFlag();
  }

  onGregorianDateChange(date: DatePickerValue | null): void {
    this.selectedGregorianDate = date;
    if (date) this.selectedHijriDate = null;
    this.updateCustomDateFlag();
  }

  onCitySelect(city: City): void {
    this.selectedCityId = city.id;

    // جرّب تقرأ الإحداثيات من الكائن نفسه أولاً (يدعم lat/lng أو latitude/longitude)
    const inlineLat = (city as any)?.lat ?? (city as any)?.latitude;
    const inlineLng = (city as any)?.lng ?? (city as any)?.longitude;
    if (typeof inlineLat === 'number' && typeof inlineLng === 'number') {
      this.selectedCoords = { lat: inlineLat, lng: inlineLng };
      this.isShowingTomorrowData = false;
      this.updateCustomDateFlag();
      this.cdr.markForCheck?.();
      return;
    }

    // لو مش موجودة، هاتها من ReferenceDataService عبر getCityById
    this.referenceDataService.getCityById(city.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(fullCity => {
        const lat = (fullCity as any)?.lat ?? (fullCity as any)?.latitude;
        const lng = (fullCity as any)?.lng ?? (fullCity as any)?.longitude;

        if (typeof lat === 'number' && typeof lng === 'number') {
          this.selectedCoords = { lat, lng };
          this.isShowingTomorrowData = false;
          this.updateCustomDateFlag();
        } else {
          this.selectedCoords = null;
          this.error = this.translate.instant('prayTimeSection.selectCityOrLocation')
                 || 'Please select a city or location';
        }
        this.cdr.markForCheck?.();
      });

    if (this.citySelector) {
      this.citySelector['selectedCityName'] = (city as any).cityName ?? '';
    }
  }

  onLocationSelect(location: LocationData): void {
    this.selectedCoords = location;
    this.selectedCityId = null;

    if (this.citySelector) {
      this.citySelector.reset();
      this.citySelector['selectedCityName'] = '';
    }
  }

  handleSearch(): void {
    this.loading = true;
    this.error = null;
    this.isShowingTomorrowData = false;
    this.updateCustomDateFlag();

    if (!this.selectedCoords) {
      this.error =
        this.translate.instant('prayTimeSection.selectCityOrLocation') ||
        'Please select a city or location';
      this.loading = false;
      return;
    }

    if (this.selectedHijriDate) {
      this.handleHijriDateSearch();
    } else if (this.selectedGregorianDate) {
      this.handleGregorianDateSearch();
    } else {
      this.handleCurrentDateSearch();
    }
  }

  private handleHijriDateSearch(): void {
    if (!this.selectedHijriDate) return;
    if (!this.selectedCoords) { this.handleNoCoordsError(); return; }

    const { year, month, dayNumber } = this.selectedHijriDate;
    this.prayerService
      .getPrayerTimesForHijriDate(
        year, month, dayNumber,
          this.selectedCoords?.lng ?? undefined, this.selectedCoords.lat?? undefined
      )
      .subscribe({
        next: (result) => { this.prayerTime = result; this.loading = false; this.cdr.markForCheck?.(); },
        error: () => { this.handleSearchError(); },
      });
  }

  private handleGregorianDateSearch(): void {
    if (!this.selectedGregorianDate) return;
    if (!this.selectedCoords) { this.handleNoCoordsError(); return; }

    const d = this.selectedGregorianDate;
    const gregorianDate = new Date(d.year, d.month - 1, d.dayNumber);

 this.prayerService.getTodayPrayerTimes(
  this.selectedCoords?.lng ?? undefined,
  this.selectedCoords?.lat ?? undefined
)

      .subscribe({
        next: (result) => { this.prayerTime = result; this.loading = false; this.cdr.markForCheck?.(); },
        error: () => { this.handleSearchError(); },
      });
  }

  private handleCurrentDateSearch(): void {
    if (!this.selectedCoords) { this.handleNoCoordsError(); return; }
this.prayerService.getTodayPrayerTimes(
  this.selectedCoords?.lng ?? undefined,
  this.selectedCoords?.lat ?? undefined
)

      .subscribe({
        next: (result) => { this.prayerTime = result; this.loading = false; this.cdr.markForCheck?.(); },
        error: () => { this.handleSearchError(); },
      });
  }

  private handleNoCoordsError(): void {
    this.error =
      this.translate.instant('prayTimeSection.selectCityOrLocation') ||
      'Please select a city or location';
    this.loading = false;
  }

  private handleSearchError(): void {
    this.error =
      this.translate.instant('prayTimeSection.error') ||
      'Error fetching prayer times';
    this.loading = false;
  }

  formatTo12Hour(time: string): string {
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

  // --- caching (اختياري) ---
  loadPrayerTimesWithCache() {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];

    const cached = localStorage.getItem(`prayerTimesCache`);
    if (cached) {
      this.prayerTime = JSON.parse(cached).data;
      this.setDatePickerToToday();
      this.loading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.loadTodayPrayerTimes({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      () => this.loadTodayPrayerTimes()
    );
  }

  loadTodayPrayerTimes(position?: { latitude: number; longitude: number }) {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    const prayerObservable = position
      ? this.prayerService.getPrayerTimesForGregorianDate(today, position.longitude, position.latitude)
      : this.prayerService.getPrayerTimesForGregorianDate(today);

    prayerObservable.subscribe({
      next: (todayResult: any) => {
        const ishaTime = this.parsePrayerTimeToDate(todayResult.prayer_times?.isha);
        const currentTime = new Date();

        if (ishaTime && currentTime.getTime() > ishaTime.getTime()) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          const tomorrowObservable = position
            ? this.prayerService.getPrayerTimesForGregorianDate(tomorrow, position.longitude, position.latitude)
            : this.prayerService.getPrayerTimesForGregorianDate(tomorrow);

          tomorrowObservable.subscribe({
            next: (tomorrowResult: any) => {
              this.prayerTime = tomorrowResult;
              localStorage.setItem(`prayerTimesCache`, JSON.stringify({ data: tomorrowResult }));
              if (position) this.setInitialCoordinates(position);
              this.setDatePickerToTomorrow();
              this.loading = false;
            },
            error: () => {
              this.prayerTime = todayResult;
              localStorage.setItem(`prayerTimesCache_${todayKey}`, JSON.stringify({ data: todayResult }));
              if (position) this.setInitialCoordinates(position);
              this.setDatePickerToToday();
              this.loading = false;
            },
          });
        } else {
          this.prayerTime = todayResult;
          localStorage.setItem(`prayerTimesCache_${todayKey}`, JSON.stringify({ data: todayResult }));
          if (position) this.setInitialCoordinates(position);
          this.setDatePickerToToday();
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
    });
  }

  getPrayerTime(key: string): string {
    if (!this.prayerTime?.prayer_times) return '--';
    return (this.prayerTime.prayer_times as any)[key] || '--';
  }

  getTimeRemaining(key: string, index: number): string {
    if (this.isShowingCustomDate) return '--';

    const timeStr = this.getPrayerTime(key);
    const prayerTime = this.parsePrayerTimeToDate(timeStr);
    if (!prayerTime) return '--';

    let diff = Math.floor((prayerTime.getTime() - this.now.getTime()) / 1000);
    if (diff < 0) return '--';

    const h = Math.floor(diff / 3600);
    diff %= 3600;
    const m = Math.floor(diff / 60);
    const s = diff % 60;

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getProgressPercent(key: string, index: number): number {
    if (this.isShowingCustomDate) return 0;

    const currentTimeStr = this.getPrayerTime(key);
    const currentTime = this.parsePrayerTimeToDate(currentTimeStr);

    const prevIndex = (index - 1 + this.prayerCardMeta.length) % this.prayerCardMeta.length;
    const prevKey = this.prayerCardMeta[prevIndex].key;
    const prevTimeStr = this.getPrayerTime(prevKey);
    let prevTime = this.parsePrayerTimeToDate(prevTimeStr);

    if (!prevTime || !currentTime) return 0;

    if (prevTime > currentTime) {
      prevTime = new Date(prevTime.getTime() - 24 * 60 * 60 * 1000);
    }

    if (this.isShowingTomorrowData) {
      const daysDifference = Math.floor(
        (currentTime.getTime() - this.now.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysDifference > 0) return 0;
    }

    const total = currentTime.getTime() - prevTime.getTime();
    const passed = this.now.getTime() - prevTime.getTime();

    if (total <= 0) return 0;
    if (passed <= 0) return 0;
    if (passed >= total) return 100;

    return Math.floor((passed / total) * 100);
  }

  private parsePrayerTimeToDate(time: string): Date | null {
    if (!time || time === '--') return null;

    const [h, m, s] = time.split(':');
    if (h === undefined || m === undefined) return null;

    const baseDate = this.isShowingTomorrowData ? this.getTomorrowDate() : new Date(this.now);
    const date = new Date(baseDate);
    date.setHours(Number(h), Number(m), s ? Number(s) : 0, 0);
    return date;
  }

  private getTomorrowDate(): Date {
    const tomorrow = new Date(this.now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  private updateCustomDateFlag(): void {
    if (!this.selectedGregorianDate && !this.selectedHijriDate) {
      this.isShowingCustomDate = false;
      return;
    }

    const today = new Date();
    const tomorrow = this.getTomorrowDate();

    if (this.selectedGregorianDate) {
      const selectedDate = new Date(
        this.selectedGregorianDate.year,
        this.selectedGregorianDate.month - 1,
        this.selectedGregorianDate.dayNumber
      );
      const isToday = this.isSameDate(selectedDate, today);
      const isTomorrow = this.isSameDate(selectedDate, tomorrow);
      this.isShowingCustomDate = !isToday && !isTomorrow;
    } else if (this.selectedHijriDate) {
      this.isShowingCustomDate = true;
    }
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  shouldShowTimeFeatures(): boolean {
    return !this.isShowingCustomDate;
  }

  getCurrentPrayerIndex(): number {
    if (!this.prayerTime?.prayer_times) return -1;
    if (this.isShowingCustomDate) return -1;

    for (let i = 0; i < this.prayerCardMeta.length; i++) {
      const prayerTime = this.parsePrayerTimeToDate(
        this.getPrayerTime(this.prayerCardMeta[i].key)
      );
      if (prayerTime && prayerTime.getTime() > this.now.getTime()) {
        return i;
      }
    }
    return 0;
  }

  isCurrentPrayer(index: number): boolean {
    return this.getCurrentPrayerIndex() === index;
  }

  scrollToQiblaCompass(): void {
    const element = document.getElementById('qibla-compass-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }
}
