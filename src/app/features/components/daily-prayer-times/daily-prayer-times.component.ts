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
import { City, PrayerTime, PrayerTimeWithDateResult } from '../../../core/types/api.types';
import {
  CitySelectorComponent,
  LocationData,
} from '../../shared/city-selector/city-selector.component';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
} from '../../shared/unified-date-picker/unified-date-picker.component';

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
        <div class="flex flex-col md:flex-row gap-4">
          <div class="w-full md:w-1/4">
            <app-unified-date-picker
              #hijriDatePicker
              type="hijri"
              [label]="'prayTimeSection.hijriDate'"
              [value]="selectedHijriDate"
              (valueChange)="onHijriDateChange($event)"
            ></app-unified-date-picker>
          </div>
          <div class="w-full md:w-1/4">
            <app-unified-date-picker
              #gregorianDatePicker
              type="gregorian"
              [label]="'prayTimeSection.gregorianDate'"
              [value]="selectedGregorianDate"
              (valueChange)="onGregorianDateChange($event)"
            ></app-unified-date-picker>
          </div>
          <div class="w-full md:w-2/4">
            <app-city-selector
              #citySelector
              [label]="'prayTimeSection.selectCity'"
              (citySelect)="onCitySelect($event)"
              (locationSelect)="onLocationSelect($event)"
            ></app-city-selector>
          </div>
        </div>

        <!-- Location Selection Row -->
        <button
          class="bg-[#1B8354] hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium font-ibm-plex-arabic"
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

      <!-- Error Message -->
      <div
        *ngIf="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-ibm-plex-arabic"
      >
        {{ error }}
      </div>

      <!-- Prayer Times Table -->
      <div
        *ngIf="prayerTime"
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
                <tr class="font-ibm-plex-arabic bg-white">
                  <td class="text-[#384250] p-4 whitespace-nowrap">
                    {{ prayerTime.day_name || '--' }}
                  </td>
                               <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
   {{ prayerTime.hijri_date.day }} {{ prayerTime.hijri_date.month_name }} {{ prayerTime.hijri_date.year }}
</td>
                
                   <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">
   {{ prayerTime.gregorian_date.day }} {{ prayerTime.gregorian_date.month_name }} {{ prayerTime.gregorian_date.year }}
</td>

                 
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(prayerTime.prayer_times.fajr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(prayerTime.prayer_times.sunrise) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(prayerTime.prayer_times.dhuhr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(prayerTime.prayer_times.asr) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
                    {{ formatTime12(prayerTime.prayer_times.maghrib) }}
                  </td>
                  <td
                    class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap"
                  >
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
export class DailyPrayerTimesComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('citySelector') citySelector!: CitySelectorComponent;
  @ViewChild('hijriDatePicker') hijriDatePicker!: UnifiedDatePickerComponent;
  @ViewChild('gregorianDatePicker')
  gregorianDatePicker!: UnifiedDatePickerComponent;

  isAr = false;
  selectedCityId: number | null = null;
  selectedCoords: LocationData | null = null;
  selectedHijriDate: DatePickerValue | null = null;
  selectedGregorianDate: DatePickerValue | null = null;
  prayerTime: PrayerTimeWithDateResult  | null = null;
  loading = false;
  error: string | null = null;
  private viewInitialized = false;
  private pendingDateUpdate: DatePickerValue | null = null;
  private destroy$ = new Subject<void>();

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
      });

    // Load initial prayer times with user's current location
    this.loadInitialPrayerTimes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    if (this.viewInitialized) {
      this.selectedGregorianDate = todayDate;
      this.cdr.detectChanges();
    } else {
      this.pendingDateUpdate = todayDate;
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
                this.prayerTime = result;
                this.setInitialCoordinates(position);
                this.setDatePickerToToday();
                this.loading = false;
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
        console.warn('Could not get user location:', e.message);

        // Try to load prayer times without location (will use server default or fail gracefully)
        this.prayerService.getTodayPrayerTimes().subscribe({
          next: (result) => {
            if (result) {
              this.prayerTime = result;
              this.setDatePickerToToday();
              this.loading = false;
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
  }

  onGregorianDateChange(date: DatePickerValue | null): void {
    this.selectedGregorianDate = date;
    // Reset Hijri date when Gregorian is selected
    if (date) {
      this.selectedHijriDate = null;
    }
  }


onCitySelect(city: City): void {
  this.selectedCoords = {
    lat: city.latitude,
    lng: city.longitude,
  
  };
  this.selectedCityId  = city.id
}


  onLocationSelect(location: LocationData): void {
    this.selectedCoords = location;
    // Reset city selection when coordinates are used
    this.selectedCityId = null;
    
  }

  handleSearch(): void {
    this.loading = true;
    this.error = null;

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
  if (this.selectedHijriDate) {
    const { year, month, dayNumber } = this.selectedHijriDate;

    if (this.selectedCityId) {
      // سيناريو 1: هجري + مدينة
      this.prayerService
        .getPrayerTimesForHijriDate(year, month, dayNumber)
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: () => this.handleSearchError(),
        });
    } else if (this.selectedCoords) {
      // سيناريو 2: هجري + إحداثيات
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
}


  /**
   * Handle search with Gregorian date (Scenarios 3 & 4)
   */
private handleGregorianDateSearch(): void {
  if (this.selectedGregorianDate) {
    const { year, month, dayNumber } = this.selectedGregorianDate;
    const gregorianDate = new Date(year, month - 1, dayNumber);

    if (this.selectedCityId) {
      this.prayerService
        .getPrayerTimesForGregorianDate(gregorianDate)
        .subscribe({
          next: (result) => {
            this.prayerTime = result;
            this.loading = false;
          },
          error: () => this.handleSearchError(),
        });
    } else if (this.selectedCoords) {
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
        .getTodayPrayerTimes(this.selectedCoords?.lng ?? undefined,
  this.selectedCoords?.lat ?? undefined)
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
