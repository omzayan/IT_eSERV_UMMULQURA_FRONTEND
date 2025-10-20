import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  GeolocationService,
  GeolocationPosition,
} from '../../../core/services/geolocation.service';
import { QiblaResult } from '../../../core/types/api.types';

@Component({
  selector: 'app-qibla-compass',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
      <div class="container mx-auto">
    <div class="p-4 md:p-[80px] flex flex-col gap-3">
      <div class="flex gap-3 w-full">
        <div class="flex flex-col gap-3">
          <!-- Title -->
          <div class="flex gap-4 w-full">
            <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
              {{ 'qiblaCompass.title' | translate }}
            </h2>
          </div>
          <!-- Subtitle -->
          <div class="font-ibm-plex-arabic text-base">
            {{ 'qiblaCompass.description' | translate }}
          </div>
        </div>
      </div>

      <div
        class="flex p-2 md:p-4 flex-col justify-center items-end gap-2 md:gap-4 self-stretch relative bg-white rounded-2xl border border-[#D2D6DB]"
      >
        <!-- Loading State -->
        <div
          *ngIf="isLoading"
          class="flex justify-center items-center h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] w-full"
        >
          <div class="flex flex-col items-center gap-4">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B8354]"
            ></div>
            <p class="text-[#58535A] font-ibm-plex-arabic">
              {{ 'qiblaCompass.loading' | translate }}
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div
          *ngIf="error && !isLoading"
          class="flex justify-center items-center h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] w-full"
        >
          <div class="flex flex-col items-center gap-4 text-center">
            <div class="text-red-500 text-4xl">⚠️</div>
            <p class="text-red-600 font-ibm-plex-arabic">{{ error }}</p>
            <button
              (click)="retryGetLocation()"
              class="px-4 py-2 bg-[#1B8354] text-white rounded-lg hover:bg-[#156d47] transition-colors font-ibm-plex-arabic"
            >
              {{ 'qiblaCompass.retry' | translate }}
            </button>
          </div>
        </div>

        <!-- Compass Content -->
        <div
          *ngIf="!isLoading && !error"
          class="flex justify-end items-start gap-2 md:gap-4 self-stretch relative"
        >
          <div
            class="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] flex-1 relative"
          >
            <!-- Map background -->
            <img
              class="w-full h-full flex-shrink-0 absolute left-0 top-0 object-cover rounded-xl"
              src="assets/images/maps.jpg"
              alt="Map background"
            />

            <!-- Overlay -->
            <div
              class="w-full h-full flex-shrink-0 absolute left-0 top-0 rounded-xl bg-white/60 backdrop-blur-[5px]"
            ></div>

            <!-- Compass SVG -->
            <svg
              class="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[360px] md:h-[360px] lg:w-[460px] lg:h-[460px] flex-shrink-0 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 ease-in-out"
              [style.transform]="
                'translate(-50%, -50%) rotate(' + qiblaDirection + 'deg)'
              "
              width="460"
              height="460"
              viewBox="0 0 460 460"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="229.703"
                cy="252.287"
                r="111.434"
                stroke="#58535A"
                stroke-width="9.50904"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M259.091 55.907C259.08 55.907 259.063 55.9092 259.049 55.907H200.911C199.45 55.907 198.102 55.1165 197.389 53.8403C196.677 52.5653 196.709 51.0013 197.476 49.7585L226.911 1.92061C227.648 0.72721 228.948 0 230.347 0H230.37C231.778 0.00966748 233.083 0.749765 233.805 1.9582L262.241 49.3503C262.794 50.041 263.123 50.9175 263.123 51.8693C263.123 54.1003 261.319 55.906 259.09 55.906L259.091 55.907Z"
                fill="#1B8354"
              />
              <!-- Additional compass paths here - shortened for brevity -->
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M229.66 311.77H229.608L229.604 311.768H229.557L229.553 311.766H229.509L229.506 311.764H229.478L229.473 311.762H229.468C229.409 311.757 229.35 311.753 229.291 311.745L161.035 303.998C159.695 303.847 158.684 302.715 158.684 301.367V211.718C158.684 210.486 159.533 209.419 160.731 209.138L229.045 193.227L229.058 193.222L229.082 193.218L229.096 193.214L229.118 193.209C229.531 193.122 229.953 193.136 230.351 193.244L298.589 209.138C299.788 209.418 300.637 210.487 300.637 211.719V301.369C300.637 302.715 299.625 303.849 298.286 304L229.959 311.753H229.945L229.94 311.755H229.922L229.917 311.757H229.908L229.903 311.76H229.884L229.88 311.762H229.851L229.845 311.764H229.822L229.812 311.766H229.77L229.766 311.768H229.719L229.714 311.77H229.658H229.66Z"
                fill="#333333"
              />
              <!-- Compass outer circle -->
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M229.999 43.9792C344.881 43.9792 438.01 137.108 438.01 251.989C438.01 366.87 344.879 460 229.999 460C115.12 460 21.9895 366.869 21.9895 251.989C21.9895 137.109 115.118 43.9792 229.999 43.9792ZM229.999 61.5977C124.848 61.5977 39.6069 146.839 39.6069 251.99C39.6069 357.141 124.848 442.383 229.999 442.383C335.15 442.383 420.393 357.142 420.393 251.99C420.393 146.838 335.15 61.5977 229.999 61.5977Z"
                fill="#333333"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M230.14 55.8657C338.534 55.8657 426.405 143.737 426.405 252.13C426.405 360.522 338.534 448.394 230.14 448.394C121.746 448.394 33.876 360.523 33.876 252.13C33.876 143.736 121.747 55.8657 230.14 55.8657ZM230.14 61.7382C124.989 61.7382 39.7474 146.98 39.7474 252.131C39.7474 357.282 124.989 442.523 230.14 442.523C335.291 442.523 420.533 357.283 420.533 252.131C420.533 146.979 335.291 61.7382 230.14 61.7382Z"
                fill="#1B8354"
              />

              <!-- Compass directions markers -->
              <g>
                <!-- North marker -->
                <path
                  d="M257.581 379.159C255.636 379.591 253.712 378.366 253.28 376.428L248.583 355.335C248.151 353.39 249.375 351.466 251.313 351.034C253.258 350.602 255.182 351.827 255.614 353.764L260.311 374.858C260.743 376.803 259.519 378.726 257.581 379.159Z"
                  fill="#474449"
                />
                <!-- Additional direction markers -->
                <path
                  d="M119.977 183.007C121.043 181.329 123.269 180.832 124.947 181.898L143.188 193.496C144.866 194.563 145.364 196.789 144.297 198.467C143.231 200.146 141.005 200.643 139.327 199.577L121.086 187.978C119.407 186.912 118.91 184.686 119.977 183.007Z"
                  fill="#FF493C"
                />
              </g>
            </svg>

            <!-- Compass Rose -->
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/bf7e8bab09f64802cf2f2ece5aebf59dca88897e?width=324"
              class="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[162px] lg:h-[162px] flex-shrink-0 absolute bottom-2 left-2 md:bottom-4 md:left-4"
              alt="Compass Rose"
            />

            <!-- Qibla Direction Info -->
            <div
              class="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-lg"
            >
              <div
                class="text-xs md:text-sm text-[#58535A] font-ibm-plex-arabic"
              >
                {{ 'qiblaCompass.direction' | translate }}:
                {{ qiblaDirection.toFixed(1) }}°
              </div>
              <div
                *ngIf="userLocation"
                class="text-xs text-[#58535A] font-ibm-plex-arabic mt-1"
              >
                {{ 'qiblaCompass.coordinates' | translate }}:
                {{ userLocation.latitude.toFixed(4) }},
                {{ userLocation.longitude.toFixed(4) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  </div>
  `,
})
export class QiblaCompassComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  qiblaDirection: number = 0; // Degrees for rotation
  isLoading: boolean = true;
  error: string | null = null;
  userLocation: GeolocationPosition | null = null;

  constructor(
    private apiService: ApiService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit(): void {
    this.getUserLocationAndQibla();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getUserLocationAndQibla(): void {
    this.isLoading = true;
    this.error = null;

    this.geolocationService
      .getCurrentPosition()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (position) => {
          this.userLocation = position;
          this.getQiblaDirection(position.longitude, position.latitude);
        },
        error: (error) => {
          console.error('Geolocation error:', error);
          this.error = error.message || 'Unable to get your location';
          this.isLoading = false;
        },
      });
  }

private getQiblaDirection(longitude: number, latitude: number): void {
  this.apiService
    .getQibla(longitude, latitude)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success && response.result) {
          // ✅ نقرأ القيمة من result.qiblahDegrees
          this.qiblaDirection = response.result.qiblahDegrees;
          console.log('Qibla direction:', this.qiblaDirection);
        } else {
          this.error =
            response.error?.message || 'Unable to get Qibla direction';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('API error:', error);
        this.error = 'Unable to get Qibla direction from server';
        this.isLoading = false;
      },
    });
}


  retryGetLocation(): void {
    this.getUserLocationAndQibla();
  }
}
