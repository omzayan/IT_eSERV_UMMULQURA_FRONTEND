import { BaseResponse } from './../types/api.types';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  PrayerTimeWithDateResult,
  MonthPrayerTimes,
  QiblaResult,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class PrayerService {
  constructor(private apiService: ApiService) {}

  /**
   * Get today's prayer times (Gregorian)
   */
  getTodayPrayerTimes(
    longitude: number = 46.69,
    latitude: number = 24.67
  ): Observable<PrayerTimeWithDateResult | null> {
    const today = new Date();
    return this.apiService
      .getDateWithPrayerTimesGregorian(today, longitude, latitude)
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
              location: { latitude, longitude },
            } as PrayerTimeWithDateResult;
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
    longitude: number = 46.69,
    latitude: number = 24.67
  ): Observable<PrayerTimeWithDateResult | null> {
    return this.apiService
      .getDateWithPrayerTimesGregorian(date, longitude, latitude)
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
              location: { latitude, longitude },
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
    year: number,
    month: number,
    day: number,
    longitude: number = 46.69,
    latitude: number = 24.67
  ): Observable<PrayerTimeWithDateResult | null> {
    return this.apiService
      .getDateWithPrayerTimesHijri(year, month, day, latitude, longitude)
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
              location: { latitude, longitude },
            } as PrayerTimeWithDateResult;
          }
          return null;
        })
      );
  }

  /**
   * Get monthly prayer times by Gregorian
   */
getMonthlyPrayerTimesByGregorian(
  year: number,
  month: number,
  longitude: number = 46.69,
  latitude: number = 24.67
): Observable<BaseResponse<MonthPrayerTimes>> {
  return this.apiService.getMonthlyPrayerTimesByGregorian(year, month, latitude, longitude);
}



  /**
   * Get monthly prayer times by Hijri
   */
  getMonthlyPrayerTimesByHijri(
    year: number,
    month: number,
    longitude: number = 46.69,
    latitude: number = 24.67
  ): Observable<BaseResponse<MonthPrayerTimes>> {
    return this.apiService
      .getMonthlyPrayerTimesByHijri(year, month, latitude, longitude);
      
  }

  /**
   * Get Qibla direction
   */
  getQiblaDirection(
    longitude: number,
    latitude: number
  ): Observable<QiblaResult | null> {
    return this.apiService.getQibla(longitude, latitude).pipe(
      map((response) => (response.success && response.result ? response.result : null))
    );
  }
}
