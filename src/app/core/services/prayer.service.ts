import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  CommonResponse,
  PrayerTimeWithDateResult,
  MonthlyPrayerTimesResult,
  PrayerTimesByCitiesResult,
  QiblaResult,
  BaseResponse,
  MonthPrayerTimes,
  PrayerTime,
} from '../types/api.types';

/**
 * Prayer service - convenience wrapper for prayer-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class PrayerService {
  constructor(private apiService: ApiService) {}

  /**
   * Get today's prayer times using current date
   */
getTodayPrayerTimes(
  longitude?: number,
  latitude?: number
): Observable<PrayerTimeWithDateResult | null> {
  const today = new Date();
  return this.apiService
    .getDateWithPrayerTimesGregorian(today, longitude ?? 46.69, latitude ?? 24.67)
    .pipe(
      map((response) => {
        if (response.success && response.result && response.result.prayerTimes.length > 0) {
          const first = response.result.prayerTimes[0];

          // نبني PrayerTimeWithDateResult من PrayerTime
          const result: PrayerTimeWithDateResult = {
            day_name: first.gregorian_date.day_name || first.hijri_date.day_name,
            hijri_date: first.hijri_date,
            gregorian_date: first.gregorian_date,
            prayer_times: {
              fajr: first.fajr,
              sunrise: first.sunrise,
              dhuhr: first.dhuhr,
              asr: first.asr,
              maghrib: first.maghrib,
              isha: first.isha,
              sunset: first.sunset,
            },
            location: {
              latitude: latitude ?? 24.67,
              longitude: longitude ?? 46.69,
            },
          };

          return result;
        }
        return null;
      })
    );
}


  /**
   * Get prayer times for a specific Gregorian date
   */
getPrayerTimesForGregorianDate(
  date: Date,
  longitude?: number,
  latitude?: number,
): Observable<PrayerTimeWithDateResult | null> {
  return this.apiService
    .getDateWithPrayerTimesGregorian(date, longitude ?? 46.69, latitude ?? 24.67)
    .pipe(
      map((response) => {
        if (response.success && response.result && response.result.prayerTimes.length > 0) {
          const first = response.result.prayerTimes[0];
          return {
            day_name: first.gregorian_date.day_name || first.hijri_date.day_name,
            hijri_date: first.hijri_date,
            gregorian_date: first.gregorian_date,
            prayer_times: {
              fajr: first.fajr,
              sunrise: first.sunrise,
              dhuhr: first.dhuhr,
              asr: first.asr,
              maghrib: first.maghrib,
              isha: first.isha,
              sunset: first.sunset,
            },
            location: {
              latitude: latitude ?? 24.67,
              longitude: longitude ?? 46.69,
            },
          } as PrayerTimeWithDateResult;
        }
        return null;
      })
    );
}



  /**
   * Get prayer times for a specific Hijri date
   */
getPrayerTimesForHijriDate(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  longitude?: number,
  latitude?: number,
): Observable<PrayerTimeWithDateResult | null> {
  return this.apiService
    .getDateWithPrayerTimesHijri(hijriYear, hijriMonth, hijriDay, latitude ?? 24.67, longitude ?? 46.69)
    .pipe(
      map((response) => {
        if (response.success && response.result && response.result.prayerTimes.length > 0) {
          const first = response.result.prayerTimes[0];
          return {
            day_name: first.gregorian_date.day_name || first.hijri_date.day_name,
            hijri_date: first.hijri_date,
            gregorian_date: first.gregorian_date,
            prayer_times: {
              fajr: first.fajr,
              sunrise: first.sunrise,
              dhuhr: first.dhuhr,
              asr: first.asr,
              maghrib: first.maghrib,
              isha: first.isha,
              sunset: first.sunset,
            },
            location: { latitude: latitude ?? 24.67, longitude: longitude ?? 46.69 },
          } as PrayerTimeWithDateResult;
        }
        return null;
      })
    );
}



  /**
   * Get prayer times for a specific date (legacy method - kept for backward compatibility)
   */
  // getPrayerTimesForDate(
  //   date: Date,
  //   longitude?: number,
  //   latitude?: number,
  //   cityId?: number
  // ): Observable<PrayerTimeWithDateResult | null> {
  //   return this.getPrayerTimesForGregorianDate(
  //     date,
  //     longitude,
  //     latitude,
  //     cityId
  //   );
  // }

  /**
   * Get monthly prayer times for current month
   */
getCurrentMonthPrayerTimes(
  longitude: number = 46.69,
  latitude: number = 24.67
): Observable<MonthPrayerTimes | null> {
  const now = new Date();
  return this.apiService.getMonthlyPrayerTimesByGregorian(
    now.getFullYear(),
    now.getMonth() + 1,
    latitude,
    longitude
  ).pipe(
    map((response) => (response.success ? response.result : null))
  );
}

  /**
   * Get monthly prayer times by Gregorian calendar
   */
getMonthlyPrayerTimesByGregorian(
  year: number,
  month: number,
  longitude?: number,
  latitude?: number
): Observable<BaseResponse<MonthPrayerTimes>> {
  return this.apiService.getMonthlyPrayerTimesByGregorian(
    year,
    month,
    longitude ?? 46.69,
    latitude ?? 24.67
  );
}

getMonthlyPrayerTimesByHijri(
  year: number,
  month: number,
  longitude?: number,
  latitude?: number
): Observable<BaseResponse<MonthPrayerTimes>> {
  return this.apiService.getMonthlyPrayerTimesByHijri(
    year,
    month,
    longitude ?? 46.69,
    latitude ?? 24.67
  );
}


  /**
   * Get prayer times for all cities
   */
  getAllCitiesPrayerTimes(): Observable<PrayerTimesByCitiesResult | null> {
    return this.apiService
      .getCitiesPrayerTimes()
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get Qibla direction
   */
  getQiblaDirection(
    longitude?: number,
    latitude?: number,
    cityNumber?: number
  ): Observable<QiblaResult | null> {
    return this.apiService
      .getQibla(longitude, latitude, cityNumber)
      .pipe(map((response) => (response.success ? response.data : null)));
  }
}
