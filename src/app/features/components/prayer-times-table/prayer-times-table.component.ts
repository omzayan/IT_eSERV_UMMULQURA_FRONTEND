import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, PrayerService, ReferenceDataService } from '../../../core/services';
import {
  PrayerTimesByCitiesResult,
  HijriDateInfo,
  GregorianDateInfo,
} from '../../../core/types/api.types';
import { forkJoin, map } from 'rxjs';
import { ApiResponse } from '../../../core';

interface PrayerTableData {
  cityName: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

@Component({
  selector: 'app-prayer-times-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
  <div class="container mx-auto">
    <div class="px-2 md:px-[80px] flex flex-col gap-3 ">
      <div class="flex gap-3 w-full">
        <div class="flex flex-col gap-3">
          <div class="flex gap-4 w-full">
            <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
              {{ 'table.title' | translate }}
            </h2>
          </div>
          <div class="font-ibm-plex-arabic text-base">
            {{ 'table.subtitle' | translate }}
          </div>
        </div>
      </div>

      <div class="flex flex-col w-full rounded-2xl border border-[#D2D6DB] overflow-hidden">
        <div class="overflow-x-auto">
          <div class="min-w-max">
            
            <!-- ✅ Header with Hijri + Gregorian Dates -->
            <div class="flex justify-around bg-[#F3F4F6] rounded-t-2xl border-b border-[#D2D6DB]">
              
              <!-- Hijri Date -->
              <div class="flex flex-col gap-2 text-[18px] font-bold text-[#384250] py-5 px-4 text-center">
                <ng-container *ngIf="hijriInfo; else noHijri">
                  <span>{{ hijriInfo.day_name }}</span>
                  <span>{{ hijriInfo.day }} {{ hijriInfo.month_name }}</span>
                  <span>{{ hijriInfo.year }} </span>
                </ng-container>
                <ng-template #noHijri><span>-</span></ng-template>
              </div>

              <img
                class="w-[80px] md:w-[120px] lg:w-[170px] aspect-square"
                src="https://api.builder.io/api/v1/image/assets/TEMP/c448e19b963bc2fc9010393c4d2fa300ae49ca30?width=340"
                alt="Calendar decoration"
              />

              <!-- Gregorian Date -->
              <div class="flex flex-col gap-2 text-[18px] font-bold text-[#384250] py-5 px-4 text-center">
                <ng-container *ngIf="gregorianDateInfo; else noGreg">
                  <span>{{ gregorianDateInfo.day_name }}</span>
                  <span>{{ gregorianDateInfo.day }} {{ gregorianDateInfo.month_name }}</span>
                  <span>{{ gregorianDateInfo.year }} </span>
                </ng-container>
                <ng-template #noGreg><span>-</span></ng-template>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="p-8 text-center font-ibm-plex-arabic">
              {{ 'loading' | translate }}
            </div>

            <!-- Error State -->
            <div *ngIf="error" class="p-8 text-center text-red-500 font-ibm-plex-arabic">
              {{ error }}
            </div>

            <!-- Prayer Times Table -->
            <table *ngIf="!loading && !error" class="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th *ngFor="let header of headers; let i = index"
                      class="text-[#384250] bg-[#F3F4F6] p-4 text-start font-ibm-plex-arabic border-b border-[#D2D6DB] whitespace-nowrap"
                      [class.border-s]="i > 0">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of data; let rowIndex = index"
                    class="font-ibm-plex-arabic"
                    [class.bg-white]="rowIndex % 2 === 0"
                    [class.bg-[#F3F4F6]]="rowIndex % 2 === 1">
                  <td class="text-[#384250] p-4 whitespace-nowrap">{{ item.cityName }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.fajr) }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.sunrise) }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.dhuhr) }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.asr) }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.maghrib) }}</td>
                  <td class="text-[#384250] p-4 border-s border-[#D2D6DB] whitespace-nowrap">{{ formatTime12(item.isha) }}</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>    </div>
  `
})
export class PrayerTimesTableComponent implements OnInit {
  data: PrayerTableData[] = [];
  citiesRaw: any[] = [];
  loading = true;
  error: string | null = null;
  hijriInfo: HijriDateInfo | null = null;
  gregorianDateInfo: GregorianDateInfo | null = null;
  headers: string[] = [];

  constructor(
    private translate: TranslateService,
    private prayerService: ApiService,
    private referenceDataService: ReferenceDataService
  ) { }

  ngOnInit(): void {
    this.updateHeaders();

    this.translate.onLangChange.subscribe(() => {
      this.updateHeaders();
      this.updateCityNames();

      this.gregorianDateInfo = this.buildGregorianInfo();
      if (this.gregorianDateInfo) {
        this.prayerService.convertGregorianToHijri({
          day: this.gregorianDateInfo.day,
          month: this.gregorianDateInfo.month,
          year: this.gregorianDateInfo.year,
        }).subscribe({
          next: (res) => {
            if (res.success && res.result) {
              this.hijriInfo = {
                ...res.result,
                formatted: `${res.result.day} ${res.result.month_name} ${res.result.year}`,
                iso: res.result.iso ?? '',
              } as HijriDateInfo;
            }
          },
          error: () => {
            this.hijriInfo = null;
          }
        });
      }
    });

    this.fetchData();
  }

  private updateHeaders(): void {
    this.headers = [
      this.translate.instant('prayers.cityTime'),
      this.translate.instant('prayers.fajr'),
      this.translate.instant('prayers.sunrise'),
      this.translate.instant('prayers.dhuhr'),
      this.translate.instant('prayers.asr'),
      this.translate.instant('prayers.maghrib'),
      this.translate.instant('prayers.isha'),
    ];
  }

  private updateCityNames(): void {
    if (this.data && this.data.length > 0) {
      this.data = this.data.map((city, index) => {
        const originalCity = this.citiesRaw[index];
        return {
          ...city,
          cityName: this.getCityName(originalCity)
        };
      });
    }
  }

  private getCityName(city: any): string {
    const lang = this.translate.currentLang || 'en';

    if (city && city.cityName) {
      const nameObj = city.cityName;
      return nameObj[lang] ?? nameObj['en'] ?? '-';
    }

    return '-';
  }



  private fetchData(): void {
    this.loading = true;
    this.error = null;

    this.gregorianDateInfo = this.buildGregorianInfo();

    this.prayerService.convertGregorianToHijri({
      day: this.gregorianDateInfo.day,
      month: this.gregorianDateInfo.month,
      year: this.gregorianDateInfo.year,
    }).subscribe({
      next: (res) => {
        if (res.success && res.result) {
          this.hijriInfo = {
            ...res.result,
            formatted: `${res.result.day} ${res.result.month_name} ${res.result.year}`,
            iso: res.result.iso ?? '',
          } as HijriDateInfo;
        }
      },
      error: () => {
        this.hijriInfo = null;
      }
    });

    this.prayerService.getPrayerTimesForAllCities().subscribe({
      next: (res) => {
        if (!res?.result || res.result.length === 0) {
          this.error = this.translate.instant('table.noData') || 'No data available';
          this.loading = false;
          return;
        }

        this.citiesRaw = res.result;
        this.data = res.result.map((city: any) => {
          const pt = city.prayerTimes[0];
          return {
            cityName: this.getCityName(city),
            fajr: pt?.fajr ?? '--',
            sunrise: pt?.sunrise ?? '--',
            dhuhr: pt?.dhuhr ?? '--',
            asr: pt?.asr ?? '--',
            maghrib: pt?.maghrib ?? '--',
            isha: pt?.isha ?? '--',
          };
        });

        this.loading = false;
      },
      error: () => {
        this.error = this.translate.instant('table.error') || 'Failed to fetch prayer times';
        this.loading = false;
      }
    });
  }


  private buildGregorianInfo(): GregorianDateInfo {
    const today = new Date();
    const lang = this.translate.currentLang || 'en';

    return {
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      month_name: today.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' }),
      day_name: today.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' }),
      formatted: today.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
      iso: today.toISOString().split('T')[0],
    };
  }

  formatTime12(time: string): string {
    if (!time) return '-';

    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const minute = m ? m.padStart(2, '0') : '00';

    // تحديد اللغة الحالية
    const currentLang = this.translate.currentLang || 'en';

    // تحويل للـ 12 ساعة
    const isPM = hour >= 12;
    const ampm = isPM ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;

    // النصوص حسب اللغة
    let suffix = '';
    switch (currentLang) {
      case 'ar':
        suffix = isPM ? 'م' : 'ص';
        break;
      case 'fr':
        suffix = isPM ? 'PM' : 'AM'; // أو تكتب 'soir/matin'
        break;
      case 'ch':
        suffix = isPM ? '下午' : '上午';
        break;
      case 'BN':
        suffix = isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
        break;
      default:
        suffix = ampm; // الإنجليزية أو أي لغة مش معرفة
    }

    return `${hour}:${minute} ${suffix}`;
  }

}
