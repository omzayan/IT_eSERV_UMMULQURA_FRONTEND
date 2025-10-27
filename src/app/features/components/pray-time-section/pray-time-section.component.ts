import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  PrayerService,
  ReferenceDataService,
  LanguageService,
  GeolocationService,
} from '../../../core/services';
import {
  PrayerTimeWithDateResult,
  City,
  PrayerTimes,
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
  key: keyof PrayerTimes;   // 👈 كده مربوط بالـ PrayerTimes
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
  <div class="container mx-auto">
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
            ⚠️ {{ 'PleaseSelectDate' | translate }}
          </div>

          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1">
              <app-city-selector
                #citySelector
                [label]="'prayTimeSection.selectCity'"
                 [defaultCityId]="21" 
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
          <div *ngIf="showCityError && !selectedCoords" class="flex items-center gap-2 text-red-600 text-sm mt-1 font-ibm-plex-arabic">
            ⚠️ {{ 'PleaseSelectCity' | translate }}
          </div>
        </div>

        <div *ngIf="error" class="text-red-500 font-ibm-plex-arabic">
          {{ error }}
        </div>
      </div>

      <!-- Prayer Cards Grid -->
  
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
  <div *ngFor="let meta of prayerCardMeta; let i = index"
       class="prayer-card relative rounded-lg overflow-hidden h-[308px] cursor-pointer transform hover:scale-105 transition-transform duration-300"
       [style.background-image]="'url(' + meta.bg + ')'">

    <div class="absolute inset-0 bg-black bg-opacity-40"></div>

    <div class="relative z-10 h-full flex flex-col justify-between px-4 pt-[40px] pb-6 text-white">
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-ibm-plex-arabic mb-1">{{ meta.name | translate }}</h3>
        <p class="text-base font-bold font-ibm-plex-arabic text-black bg-white w-fit rounded px-2">
          {{ formatTo12Hour(getPrayerTime(meta.key)) }}
        </p>
      </div>

      <!-- باقي الصلوات -->
      <div *ngIf="!isNextPrayer(i)" class="flex flex-col gap-2 mt-2">
        <div class="flex justify-between items-center">
          <p class="text-sm font-ibm-plex-arabic">{{ 'prayTimeSection.remaining' | translate }}</p>
          <p class="text-sm font-bold font-ibm-plex-arabic">
            {{ getTimeRemaining(meta.key, i) }}
          </p>
        </div>
      </div>

      <!-- الصلاة الجاية → الدايرة -->
      <div *ngIf="isNextPrayer(i)" class="flex flex-col items-center justify-center flex-1">
        <div class="circular-countdown relative">
          <svg class="countdown-circle" width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="80" fill="transparent" stroke="#1B8354" stroke-width="5"
                    stroke-dasharray="3 8"></circle>
            <circle cx="90" cy="90" r="80" fill="transparent" stroke="white" stroke-width="5"
                    stroke-dasharray="3 8"
                    [style.stroke-dashoffset]="(getProgressPercent(meta.key, i) / 100) * 502.4"
                    class="countdown-progress"></circle>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-3xl font-bold font-ibm-plex-arabic text-white mb-2">
              {{ getTimeRemaining(meta.key, i) }}
            </div>
            <div class="text-sm font-ibm-plex-arabic text-white opacity-80">
              {{ 'prayTimeSection.remaining' | translate }}
            </div>
          </div>
        </div>
      </div>

    </div>
      </div>
  </div>
</div>

  `,
  styles: [`
    .prayer-card { background-size: cover; background-position: center; background-repeat: no-repeat; }
    .circular-countdown { position: relative; display: flex; align-items: center; justify-content: center; }
    .countdown-circle { transform: rotate(-90deg); }
    .countdown-progress { transition: stroke-dashoffset 1s ease-in-out; }
  `]
})
export class PrayTimeSectionComponent implements OnInit, OnDestroy {
  @ViewChild('citySelector') citySelector!: CitySelectorComponent;
  @ViewChild('hijriDatePicker') hijriDatePicker!: UnifiedDatePickerComponent;
  @ViewChild('gregorianDatePicker') gregorianDatePicker!: UnifiedDatePickerComponent;

  isAr = false;
  selectedCoords: LocationData | null = null;
  selectedHijriDate: DatePickerValue | null = null;
  selectedGregorianDate: DatePickerValue | null = null;
  prayerTime: PrayerTimeWithDateResult | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

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
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => this.isAr = lang === 'ar');
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit(): void {
  setTimeout(() => {
    const today = new Date();
this.selectedGregorianDate = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  dayNumber: today.getDate()
};
this.selectedCoords = { lat: 21.42, lng: 39.83 };
this.prayerTime = null;
this.handleGregorianDateSearch();


  });
}


handleSearch(): void {
  this.loading = true;
  this.error = null;

  // ✅ لازم مدينة
  if (!this.selectedCoords) {
    this.showCityError = true;
    this.showDateError = false;
    this.loading = false;
    return;
  }

  // ✅ لازم تاريخ (هجري أو ميلادي)
  if (!this.selectedHijriDate && !this.selectedGregorianDate) {
    this.showDateError = true;
    this.loading = false;
    return;
  }

  // ✅ الاتنين موجودين → نفذ البحث
  this.showCityError = false;
  this.showDateError = false;
  this.prayerTime = null;

  if (this.selectedHijriDate) {
    this.handleHijriDateSearch();
  } else {
    this.handleGregorianDateSearch();
  }
}


  private handleHijriDateSearch(): void {
    if (!this.selectedHijriDate || !this.selectedCoords) return;
    const { year, month, dayNumber } = this.selectedHijriDate;
    this.prayerService.getPrayerTimesForHijriDate(
      year, month, dayNumber, this.selectedCoords.lng??undefined, this.selectedCoords.lat??undefined
    ).subscribe({
      next: (res) => { this.prayerTime = res; this.loading = false; this.cdr.detectChanges(); },
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
      next: (res) => { this.prayerTime = res; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'خطأ في جلب البيانات'; this.loading = false; }
    });
  }

  // ✅ Helpers
  getPrayerTime(key: string): string {
    if (!this.prayerTime?.prayer_times) return '--';
    return (this.prayerTime.prayer_times as any)[key] || '--';
  }

  formatTo12Hour(time: string): string {
    if (!time || time === '--') return '--';
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12
      ? this.translate.instant('prayTimeSection.pm')
      : this.translate.instant('prayTimeSection.am');

    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

 
  shouldShowTimeFeatures(): boolean {
    return true;
  }


  scrollToQiblaCompass(): void {
    document.getElementById('qibla-compass')?.scrollIntoView({ behavior: 'smooth' });
  }
  onHijriDateChange(date: DatePickerValue | null): void {
  this.selectedHijriDate = date;
  if (date) this.selectedGregorianDate = null; // لما يختار هجري يفضي الميلادي

  // ✅ لو التاريخ اتغير والمدينة لسه مش مختارة
  if (!this.selectedCoords) {
    this.showCityError = true;
  } else {
    this.showCityError = false;
  }
}

onGregorianDateChange(date: DatePickerValue | null): void {
  this.selectedGregorianDate = date;
  if (date) this.selectedHijriDate = null; // لما يختار ميلادي يفضي الهجري

  // ✅ لو التاريخ اتغير والمدينة لسه مش مختارة
  if (!this.selectedCoords) {
    this.showCityError = true;
  } else {
    this.showCityError = false;
  }
}

onCitySelect(city: City): void {
  const lat = (city as any).lat ?? (city as any).latitude;
  const lng = (city as any).lng ?? (city as any).longitude;
  if (lat && lng) {
    this.selectedCoords = { lat, lng };
  }

  // ✅ لو اختار مدينة بس من غير تاريخ
  if (!this.selectedHijriDate && !this.selectedGregorianDate) {
    this.showDateError = true;
  } else {
    this.showDateError = false;
  }
}

onLocationSelect(location: LocationData): void {
  this.selectedCoords = location;

  // ✅ نفس التحقق زي اختيار المدينة
  if (!this.selectedHijriDate && !this.selectedGregorianDate) {
    this.showDateError = true;
  } else {
    this.showDateError = false;
  }
}

private buildDateFromTime(time: string, baseDate: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}


private getNextPrayer(): { key: keyof PrayerTimes, date: Date } | null {
  if (!this.prayerTime?.prayer_times) return null;
  const now = new Date();
  const today = new Date();

  let times = (Object.keys(this.prayerTime.prayer_times) as (keyof PrayerTimes)[])
    .map(k => ({ key: k, date: this.buildDateFromTime(this.prayerTime!.prayer_times[k]!, today) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // لو مفيش أي صلاة فاضلة النهارده → نضيف فجر اليوم التالي
  let next = times.find(t => t.date > now);
  if (!next) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const fajr = this.buildDateFromTime(this.prayerTime!.prayer_times['fajr']!, tomorrow);
    next = { key: 'fajr', date: fajr };
  }

  return next;
}

private getCurrentPrayer(): { key: keyof PrayerTimes, date: Date } | null {
  if (!this.prayerTime?.prayer_times) return null;
  const now = new Date();
  const today = new Date();

  const times = (Object.keys(this.prayerTime.prayer_times) as (keyof PrayerTimes)[])
    .map(k => ({ key: k, date: this.buildDateFromTime(this.prayerTime!.prayer_times[k]!, today) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = 0; i < times.length; i++) {
    const current = times[i];
    const next = times[i + 1];
    if (next && now >= current.date && now < next.date) return current;
  }

  // لو عدينا كل الصلوات → الصلاة الحالية تفضل العشاء
  const isha = times.find(t => t.key === 'isha');
  return isha || null;
}

// 🟢 هل الكارت ده الصلاة الحالية؟
isCurrentPrayer(index: number): boolean {
  const current = this.getCurrentPrayer();
  return current ? this.prayerCardMeta[index].key === current.key : false;
}

// 🟢 هل الكارت ده هو الصلاة الجاية؟
 isNextPrayer(index: number): boolean {
  const next = this.getNextPrayer();
  return next ? this.prayerCardMeta[index].key === next.key : false;
}

getTimeRemaining(key: keyof PrayerTimes, index: number): string {
  if (!this.prayerTime?.prayer_times) return '00:00';

  const now = new Date();
  const today = new Date();

  const prayerTimeStr = this.prayerTime.prayer_times[key];
  if (!prayerTimeStr) return '00:00';

  const prayerDate = this.buildDateFromTime(prayerTimeStr, today);

  // لو الصلاة عدّت خلاص → صفر
  if (prayerDate <= now) return '00:00';

  // لسه جاية → احسب الفرق
  let diff = Math.floor((prayerDate.getTime() - now.getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}




// 🟢 نسبة التقدم (progress) من وقت الصلاة الحالية للي بعدها
getProgressPercent(key: keyof PrayerTimes, index: number): number {
  const current = this.getCurrentPrayer();
  const next = this.getNextPrayer();
  if (!current || !next) return 0;

  if (this.prayerCardMeta[index].key !== current.key) return 0;

  const now = new Date();
  const total = (next.date.getTime() - current.date.getTime()) / 1000;
  const elapsed = (now.getTime() - current.date.getTime()) / 1000;

  if (elapsed < 0) return 0;
  if (elapsed > total) return 100;

  return Math.round((elapsed / total) * 100);
}


}
