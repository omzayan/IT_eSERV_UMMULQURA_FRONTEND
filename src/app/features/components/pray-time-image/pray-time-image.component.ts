import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, Subscription, Subject, takeUntil } from 'rxjs';
import { PrayerService, GeolocationService } from '../../../core/services';
import { PrayerTimeWithDateResult } from '../../../core/types/api.types';

interface PrayerImages {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface NextEvent {
  key: string;
  time: Date;
  timeStr: string;
}

type EventKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

@Component({
  selector: 'app-pray-time-image',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-4 md:p-[80px] flex flex-col gap-3">
      <!-- Loading State -->
      <div *ngIf="loading" class="text-center text-white p-8">
        {{ 'loading' | translate }}
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="text-center text-red-500 p-8">
        {{ error }}
      </div>

      <!-- Prayer Time Content -->
      <div
        *ngIf="prayerTime && !loading && !error"
        class="w-full h-[440px] bg-center bg-no-repeat rounded-2xl relative"
        [style.background-image]="'url(' + currentImage + ')'"
        [style.background-size]="'contain'"
      >
        <div class="absolute bottom-[48px] left-0 w-full">
          <div class="flex justify-center items-center flex-col gap-2">
            <!-- Coordinates Display -->
            <span class="text-white text-[32px] font-medium">
              {{ formatCoordinates() }}
            </span>

            <!-- Hijri Date -->
            <span class="text-white text-[16px]">
              {{ getHijriDate() }}
            </span>

            <!-- Next Prayer Info -->
            <span class="text-white text-[32px] font-medium">
              {{ ('prayers.remainingTime' | translate) + ' ' + getEventName() }}
            </span>

            <!-- Countdown Timer -->
            <span class="text-white text-[40px] font-semibold">
              {{ remainingTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pray-time-image {
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
      }
    `,
  ],
})
export class PrayTimeImageComponent implements OnInit, OnDestroy {
  prayerTime: PrayerTimeWithDateResult | null = null;
  loading = false;
  error: string | null = null;
  coords: { lat: number; lng: number } | null = null;
  now = new Date();
  remainingTime = '--:--:--';
  currentImage = 'assets/images/dhuhr.png';
  currentEventName = '';

  private timeSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  private readonly prayerImages: PrayerImages = {
    fajr: 'assets/images/fajr.png',
    sunrise: 'assets/images/sunrise.png',
    dhuhr: 'assets/images/dhuhr.png',
    asr: 'assets/images/asr.png',
    maghrib: 'assets/images/maghrib.jpg',
    isha: 'assets/images/isha.png',
  };

  private readonly prayerOrder: EventKey[] = [
    'fajr',
    'sunrise',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  constructor(
    private translate: TranslateService,
    private prayerService: PrayerService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit(): void {
    // Update time every second
    this.timeSubscription = interval(1000).subscribe(() => {
      this.now = new Date();
      this.updateCountdown();
    });

    // Get user location and fetch prayer times
    this.getUserLocationAndFetchPrayerTimes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  private getUserLocationAndFetchPrayerTimes(): void {
    this.geolocationService
      .getCurrentPosition()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (position) => {
          this.coords = {
            lat: position.latitude,
            lng: position.longitude,
          };
          this.fetchPrayerTimes();
        },
        error: (e) => {
          this.error =
            this.translate.instant('error.locationAccess') ||
            'Location access denied';
        },
      });
  }

  private fetchPrayerTimes(): void {
    if (!this.coords) return;

    this.loading = true;
    this.error = null;

    this.prayerService
      .getTodayPrayerTimes(this.coords.lng, this.coords.lat)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.prayerTime = result;
          this.updateCountdown();
          this.loading = false;
        },
        error: (e) => {
          this.error =
            this.translate.instant('error.fetchPrayerTimes') ||
            'Failed to fetch prayer times';
          this.loading = false;
        },
      });
  }

private getNextEvent(): NextEvent | null {
  if (!this.prayerTime?.prayer_times) return null;

  const today = new Date();
  const times = (this.prayerOrder).map(key => {
    const timeStr = (this.prayerTime!.prayer_times as any)[key];
    if (!timeStr) return null;

    const [h, m] = timeStr.split(':');
    const date = new Date(today);
    date.setHours(Number(h), Number(m), 0, 0);

    return { key, time: date, timeStr };
  }).filter(Boolean) as NextEvent[];

  // ⏳ لسه باقي صلوات النهارده
  const next = times.find(t => t.time > this.now);
  if (next) return next;

  // 🌙 لو اليوم خلص → فجر بكرة
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const fajrTimeStr = (this.prayerTime!.prayer_times as any)['fajr'];
  if (fajrTimeStr) {
    const [h, m] = fajrTimeStr.split(':');
    const fajrDate = new Date(tomorrow);
    fajrDate.setHours(Number(h), Number(m), 0, 0);
    return { key: 'fajr', time: fajrDate, timeStr: fajrTimeStr };
  }

  return null;
}
private buildDateFromTime(time: string, baseDate: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

private getCurrentPrayer(): { key: EventKey, date: Date } | null {
  if (!this.prayerTime?.prayer_times) return null;
  const now = new Date();
  const today = new Date();

  const times = this.prayerOrder.map(key => {
    const t = (this.prayerTime!.prayer_times as any)[key];
    return { key, date: this.buildDateFromTime(t, today) };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = 0; i < times.length - 1; i++) {
    const current = times[i];
    const next = times[i + 1];
    if (now >= current.date && now < next.date) {
      return current;
    }
  }

  // لو عدينا كل الصلوات → اعتبر آخر صلاة (العشاء) هي الحالية
  return times.find(t => t.key === 'isha') || null;
}

private getNextPrayer(): { key: EventKey, date: Date } | null {
  if (!this.prayerTime?.prayer_times) return null;
  const now = new Date();
  const today = new Date();

  const times = this.prayerOrder.map(key => {
    const t = (this.prayerTime!.prayer_times as any)[key];
    return { key, date: this.buildDateFromTime(t, today) };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  let next = times.find(t => t.date > now);
  if (next) return next;

  // لو اليوم خلص → فجر بكرة
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const fajr = this.buildDateFromTime(this.prayerTime!.prayer_times['fajr'], tomorrow);
  return { key: 'fajr', date: fajr };
}



private updateCountdown(): void {
  if (!this.prayerTime) return;

  const current = this.getCurrentPrayer();
  const next = this.getNextPrayer();

  if (!next) {
    this.remainingTime = '--:--:--';
    this.currentEventName = '';
    return;
  }

  const diff = Math.floor((next.date.getTime() - this.now.getTime()) / 1000);

  if (diff <= 0) {
    this.remainingTime = '00:00:00';
    this.currentEventName = next.key;
    this.currentImage = this.prayerImages[next.key];
    return;
  }

  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(diff % 60).toString().padStart(2, '0');

  this.remainingTime = `${h}:${m}:${s}`;
  this.currentImage = this.prayerImages[next.key];
  this.currentEventName = next.key;

  // 🟢 لو عايز تعرض الحالية كمان
  // console.log("Current Prayer:", current?.key, "Next Prayer:", next.key);
}




  formatCoordinates(): string {
    if (!this.prayerTime) return '';

    // Use the coordinates from prayer time response or fallback to current coords
    const lat = Number(
      this.prayerTime.location.latitude || this.coords?.lat || 0
    );
    const lng = Number(
      this.prayerTime.location.longitude || this.coords?.lng || 0
    );

    return `${lat.toFixed(4)}-${lng.toFixed(4)}`;
  }

  getHijriDate(): string {
    if (!this.prayerTime?.hijri_date) return '';

    // Format the hijri date properly
    const hijri = this.prayerTime.hijri_date;
    return `${hijri.day} ${hijri.month_name} ${hijri.year}`;
  }

  getEventName(): string {
    if (!this.currentEventName) return '';

    // Handle sunrise special case and translate prayer names
    if (this.currentEventName === 'sunrise') {
      return this.translate.instant('prayers.sunrise') || 'Sunrise';
    }

    return (
      this.translate.instant(`prayers.${this.currentEventName}`) ||
      this.currentEventName
    );
  }
}
