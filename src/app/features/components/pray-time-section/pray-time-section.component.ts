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
  CityData,
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
                [disabled]="loading || (!selectedCityId && !selectedCoords)"
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
                  {{ meta.name }}
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

  Math = Math; // Make Math available in template
  isAr = false;
  selectedCityId: number | null = null;
  selectedCoords: LocationData | null = null;
  selectedHijriDate: DatePickerValue | null = null;
  selectedGregorianDate: DatePickerValue | null = null;
  prayerTime: PrayerTimeWithDateResult | null = null;
  loading = false;
  error: string | null = null;
  now = new Date();
  isShowingTomorrowData = false; // Flag to indicate if we're showing tomorrow's prayer times
  isShowingCustomDate = false; // Flag to indicate if user selected a custom date
  private viewInitialized = false; // Flag to track if view is initialized
  private pendingDateUpdate: DatePickerValue | null = null; // Store pending date update
  private timeSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  prayerCardMeta: PrayerCardMeta[] = [];

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private languageService: LanguageService,
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes using the language service
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isAr = language === 'ar';
        this.updatePrayerNames();
      });

    // Update time every second
    this.timeSubscription = interval(60000).subscribe(() => {
      this.now = new Date();
    });

    // Update prayer names initially
    this.updatePrayerNames();

    // Load initial prayer times with user's current location
    this.loadInitialPrayerTimes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // If there's a pending date update, apply it now
    if (this.pendingDateUpdate) {
    
      this.selectedGregorianDate = this.pendingDateUpdate;
      this.pendingDateUpdate = null;
      this.cdr.detectChanges();
    }
  }

  private updatePrayerNames(): void {
    this.prayerCardMeta = [
      {
        key: 'fajr',
        name: this.translate.instant('prayers.fajr'),
        bg: 'assets/images/fajr-time.png',
      },
      {
        key: 'sunrise',
        name: this.translate.instant('prayers.sunrise'),
        bg: 'assets/images/sunrise-time.png',
      },
      {
        key: 'dhuhr',
        name: this.translate.instant('prayers.dhuhr'),
        bg: 'assets/images/dhuhr-time.png',
      },
      {
        key: 'asr',
        name: this.translate.instant('prayers.asr'),
        bg: 'assets/images/asr-time.png',
      },
      {
        key: 'maghrib',
        name: this.translate.instant('prayers.maghrib'),
        bg: 'assets/images/maghrib-time.png',
      },
      {
        key: 'isha',
        name: this.translate.instant('prayers.isha'),
        bg: 'assets/images/isha-time.png',
      },
    ];
  }

  /**
   * Set initial coordinates when loading prayer times for the first time
   */
  private setInitialCoordinates(position: {
    latitude: number;
    longitude: number;
  }): void {
    this.selectedCoords = {
      lat: position.latitude,
      lng: position.longitude,
    };
    // Ensure city ID is cleared when using coordinates
    this.selectedCityId = null;
  }

  /**
   * Set the date picker to show today's date when we load current day's prayer times
   */
  private setDatePickerToToday(): void {
    const today = new Date();

    const todayDate = {
      dayNumber: today.getDate(),
      month: today.getMonth() + 1, // Month is 1-based in our interface
      year: today.getFullYear(),
    };

    // Clear Hijri date to maintain exclusivity
    this.selectedHijriDate = null;

    // Flag that we're showing today's data
    this.isShowingTomorrowData = false;
    this.isShowingCustomDate = false; // Auto-selected date is not custom

  

    if (this.viewInitialized) {
      this.selectedGregorianDate = todayDate;
      this.cdr.detectChanges();
    } else {
      this.pendingDateUpdate = todayDate;
    }
  }

  /**
   * Set the date picker to show tomorrow's date when we automatically load next day's prayer times
   */
  private setDatePickerToTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowDate = {
      dayNumber: tomorrow.getDate(),
      month: tomorrow.getMonth() + 1, // Month is 1-based in our interface
      year: tomorrow.getFullYear(),
    };

    // Clear Hijri date to maintain exclusivity
    this.selectedHijriDate = null;

    // Flag that we're showing tomorrow's data
    this.isShowingTomorrowData = true;
    this.isShowingCustomDate = false; // Auto-selected date is not custom

    console.log('Set date picker to tomorrow:', tomorrowDate);

    if (this.viewInitialized) {
      this.selectedGregorianDate = tomorrowDate;
      this.cdr.detectChanges();
    } else {
      this.pendingDateUpdate = tomorrowDate;
    }
  }

  /**
   * Check if current time is past Isha and load appropriate prayer times
   */
  private handleInitialPrayerTimes(
    todayResult: PrayerTimeWithDateResult,
    position?: { latitude: number; longitude: number }
  ): void {
    const ishaTime = this.parsePrayerTimeToDate(
      todayResult.prayer_times?.isha || ''
    );
    const currentTime = new Date();

    console.log('Checking Isha time:', {
      ishaTime: ishaTime?.toLocaleString(),
      currentTime: currentTime.toLocaleString(),
      isPastIsha: ishaTime && currentTime.getTime() > ishaTime.getTime(),
    });

    if (ishaTime && currentTime.getTime() > ishaTime.getTime()) {
      // Current time is past Isha, get tomorrow's prayer times
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const prayerObservable = position
        ? this.prayerService.getPrayerTimesForGregorianDate(
            tomorrow,
            position.longitude,
            position.latitude,
            
          )
        : this.prayerService.getPrayerTimesForGregorianDate(tomorrow);

      prayerObservable.subscribe({
        next: (tomorrowResult) => {
          this.prayerTime = tomorrowResult;
          if (position) {
            this.setInitialCoordinates(position);
          }
          // Set the Gregorian date picker to show tomorrow's date
          this.setDatePickerToTomorrow();
          this.loading = false;
        },
        error: (e) => {
          // If tomorrow's data fails, use today's data
          this.prayerTime = todayResult;
          if (position) {
            this.setInitialCoordinates(position);
          }
          this.loading = false;
        },
      });
    } else {
      // Current time is before or during today's prayers
      this.prayerTime = todayResult;
      if (position) {
        this.setInitialCoordinates(position);
      }
      // Set the Gregorian date picker to show today's date
      this.setDatePickerToToday();
      this.loading = false;
    }
  }

  /**
   * Load initial prayer times with user's current location and current date
   */
  private loadInitialPrayerTimes(): void {
    this.loading = true;
    this.error = null;

    // Try to get user's current location
    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        // Load prayer times with current location and current date
        this.prayerService
          .getTodayPrayerTimes(position.longitude, position.latitude)
          .subscribe({
            next: (result) => {
              if (result) {
                this.handleInitialPrayerTimes(result, position);
              } else {
                this.loading = false;
              }
            },
            error: (e) => {
              this.error =
                this.translate.instant('prayTimeSection.error') ||
                'Error fetching prayer times';
              this.loading = false;
            },
          });
      },
      error: (e) => {
        // If location access is denied or not available, try to load default prayer times
        // This helps with the Isha scenario even without location
        console.warn('Could not get user location:', e.message);

        // Try to load prayer times without location (will use server default or fail gracefully)
        this.prayerService.getTodayPrayerTimes().subscribe({
          next: (result) => {
            if (result) {
              this.handleInitialPrayerTimes(result); // No position parameter
            } else {
              this.loading = false;
            }
          },
          error: (e) => {
            // Complete fallback - just stop loading
            this.loading = false;
          },
        });
      },
    });
  }

  onHijriDateChange(date: DatePickerValue | null): void {
    this.selectedHijriDate = date;
    // Reset Gregorian date when Hijri is selected
    if (date) {
      this.selectedGregorianDate = null;
    }
    // Update custom date flag
    this.updateCustomDateFlag();
  }

  onGregorianDateChange(date: DatePickerValue | null): void {
    this.selectedGregorianDate = date;
    // Reset Hijri date when Gregorian is selected
    if (date) {
      this.selectedHijriDate = null;
    }
    // Update custom date flag
    this.updateCustomDateFlag();
  }

onCitySelect(city: City): void {
  // id الخاص بالمدينة
  this.selectedCityId = city.id;

  // الإحداثيات
  this.selectedCoords = {
    lat: city.latitude ?? 0,
    lng: city.longitude ?? 0,
  };

  // الاسم كمان (اختياري)
  //this.selectedCityName = city.name;
}


  


  onLocationSelect(location: LocationData): void {
    this.selectedCoords = location;
    // Reset city selection when coordinates are used
    this.selectedCityId = null;
    if (this.citySelector) {
      this.citySelector.reset();
    }
  }

  handleSearch(): void {
    this.loading = true;
    this.error = null;
    // Reset the tomorrow flag since user is manually searching
    this.isShowingTomorrowData = false;
    // Update custom date flag based on current selections
    this.updateCustomDateFlag();

    // Validate that we have either city or coordinates, but not both
    if (!this.selectedCityId && !this.selectedCoords) {
      this.error =
        this.translate.instant('prayTimeSection.selectCityOrLocation') ||
        'Please select a city or location';
      this.loading = false;
      return;
    }

    // Scenario 1 & 2: Hijri date selected
    if (this.selectedHijriDate) {
      this.handleHijriDateSearch();
    }
    // Scenario 3 & 4: Gregorian date selected
    else if (this.selectedGregorianDate) {
      this.handleGregorianDateSearch();
    }
    // Default: Use current date with Gregorian API
    else {
      this.handleCurrentDateSearch();
    }
  }

  /**
   * Handle search with Hijri date (Scenarios 1 & 2)
   */
private handleHijriDateSearch(): void {
  if (!this.selectedHijriDate) {
    return;
  }

  this.loading = true;

  const { year, month, dayNumber } = this.selectedHijriDate;

  if (this.selectedCityId) {
    // Scenario 1: Hijri date + City ID
    this.prayerService
      .getPrayerTimesForHijriDate(year, month, dayNumber, undefined, undefined)
      .subscribe({
        next: (result) => {
          this.prayerTime = result;
          this.loading = false;
        },
        error: () => {
          this.handleSearchError();
        },
      });
  } else if (this.selectedCoords) {
    // Scenario 2: Hijri date + Coordinates
    this.prayerService
      .getPrayerTimesForHijriDate(
        year,
        month,
        dayNumber,
        this.selectedCoords.lng,
        this.selectedCoords.lat
      )
      .subscribe({
        next: (result) => {
          this.prayerTime = result;
          this.loading = false;
        },
        error: () => {
          this.handleSearchError();
        },
      });
  }
}
  /**
   * Handle search with Gregorian date (Scenarios 3 & 4)
   */
  private handleGregorianDateSearch(): void {
    const gregorianDate = new Date(
      this.selectedGregorianDate!.year,
      this.selectedGregorianDate!.month - 1, // Month is 0-based in Date constructor
      this.selectedGregorianDate!.dayNumber
    );

    if (this.selectedCityId) {
      // Scenario 3: Gregorian date + City ID
      this.prayerService
        .getPrayerTimesForGregorianDate(
          gregorianDate,
          undefined,
          undefined,
         
        )
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: (e) => {
            this.handleSearchError();
          },
        });
    } else if (this.selectedCoords) {
      // Scenario 4: Gregorian date + Coordinates (auto-detect)
      this.prayerService
        .getPrayerTimesForGregorianDate(
          gregorianDate,
          this.selectedCoords.lng,
          this.selectedCoords.lat,
          
        )
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: (e) => {
            this.handleSearchError();
          },
        });
    }
  }

  /**
   * Handle search with current date (default behavior)
   */
  private handleCurrentDateSearch(): void {
    if (this.selectedCityId) {
      // Current date + City ID
      this.prayerService
        .getTodayPrayerTimes(undefined, undefined)
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: (e) => {
            this.handleSearchError();
          },
        });
    } else if (this.selectedCoords) {
      // Current date + Coordinates
      this.prayerService
        .getTodayPrayerTimes(this.selectedCoords.lng, this.selectedCoords.lat)
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: (e) => {
            this.handleSearchError();
          },
        });
    }
  }

  /**
   * Handle search errors consistently
   */
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

  getPrayerTime(key: string): string {
    if (!this.prayerTime?.prayer_times) return '--';
    return (this.prayerTime.prayer_times as any)[key] || '--';
  }

  getTimeRemaining(key: string, index: number): string {
    // Don't calculate remaining time for custom dates
    if (this.isShowingCustomDate) {
      return '--';
    }

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
    // Don't calculate progress for custom dates
    if (this.isShowingCustomDate) {
      return 0;
    }

    const currentTimeStr = this.getPrayerTime(key);
    const currentTime = this.parsePrayerTimeToDate(currentTimeStr);

    // Get previous prayer time
    const prevIndex =
      (index - 1 + this.prayerCardMeta.length) % this.prayerCardMeta.length;
    const prevKey = this.prayerCardMeta[prevIndex].key;
    const prevTimeStr = this.getPrayerTime(prevKey);
    let prevTime = this.parsePrayerTimeToDate(prevTimeStr);

    if (!prevTime || !currentTime) return 0;

    // Handle day boundary
    if (prevTime > currentTime) {
      prevTime = new Date(prevTime.getTime() - 24 * 60 * 60 * 1000);
    }

    // Special handling when showing tomorrow's data
    if (this.isShowingTomorrowData) {
      // When we're showing tomorrow's prayer times, and the current time is still today,
      // we need to adjust the progress calculation to show meaningful progress
      const daysDifference = Math.floor(
        (currentTime.getTime() - this.now.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysDifference > 0) {
        // The prayer time is tomorrow, so show minimal progress (since we haven't reached tomorrow yet)
        return 0;
      }
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

    // Use the correct date context based on whether we're showing tomorrow's data
    const baseDate = this.isShowingTomorrowData
      ? this.getTomorrowDate()
      : new Date(this.now);

    const date = new Date(baseDate);
    date.setHours(Number(h), Number(m), s ? Number(s) : 0, 0);
    return date;
  }

  /**
   * Get tomorrow's date for prayer time calculations
   */
  private getTomorrowDate(): Date {
    const tomorrow = new Date(this.now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * Check if the selected date is a custom date (not today or auto-selected tomorrow)
   */
  private updateCustomDateFlag(): void {
    // If no date is selected (initial load), it's not custom
    if (!this.selectedGregorianDate && !this.selectedHijriDate) {
      this.isShowingCustomDate = false;
      return;
    }

    const today = new Date();
    const tomorrow = this.getTomorrowDate();

    // Check if the selected Gregorian date is today or tomorrow
    if (this.selectedGregorianDate) {
      const selectedDate = new Date(
        this.selectedGregorianDate.year,
        this.selectedGregorianDate.month - 1,
        this.selectedGregorianDate.dayNumber
      );

      const isToday = this.isSameDate(selectedDate, today);
      const isTomorrow = this.isSameDate(selectedDate, tomorrow);

      this.isShowingCustomDate = !isToday && !isTomorrow;

      
    }
    // For Hijri dates, consider them custom for now (unless you want to implement Hijri comparison)
    else if (this.selectedHijriDate) {
      this.isShowingCustomDate = true;
    }
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if we should show time-related features (remaining time, progress bars)
   * Only show for today's or auto-selected tomorrow's prayer times, not custom dates
   */
  shouldShowTimeFeatures(): boolean {
    return !this.isShowingCustomDate;
  }

  getCurrentPrayerIndex(): number {
    if (!this.prayerTime?.prayer_times) return -1;

    // Don't calculate current prayer for custom dates
    if (this.isShowingCustomDate) {
      return -1;
    }

    // Find the next prayer time after current time
    for (let i = 0; i < this.prayerCardMeta.length; i++) {
      const prayerTime = this.parsePrayerTimeToDate(
        this.getPrayerTime(this.prayerCardMeta[i].key)
      );
      if (prayerTime && prayerTime.getTime() > this.now.getTime()) {
        return i;
      }
    }

    // If no prayer found after current time, next prayer is Fajr (index 0)
    return 0;
  }

  isCurrentPrayer(index: number): boolean {
    return this.getCurrentPrayerIndex() === index;
  }

  scrollToQiblaCompass(): void {
    const element = document.getElementById('qibla-compass-section');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }
}
