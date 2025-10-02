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
    latitude?: number,
    cityId?: number
  ): Observable<PrayerTimeWithDateResult | null> {
    const today = new Date();
    return this.apiService
      .getDateWithPrayerTimesGregorian(today, longitude, latitude, cityId)
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get prayer times for a specific Gregorian date
   */
  getPrayerTimesForGregorianDate(
    date: Date,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<PrayerTimeWithDateResult | null> {
    return this.apiService
      .getDateWithPrayerTimesGregorian(date, longitude, latitude, cityId)
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get prayer times for a specific Hijri date
   */
  getPrayerTimesForHijriDate(
    hijriDate: Date,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<PrayerTimeWithDateResult | null> {
    return this.apiService
      .getDateWithPrayerTimesHijri(hijriDate, longitude, latitude, cityId)
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get prayer times for a specific date (legacy method - kept for backward compatibility)
   */
  getPrayerTimesForDate(
    date: Date,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<PrayerTimeWithDateResult | null> {
    return this.getPrayerTimesForGregorianDate(
      date,
      longitude,
      latitude,
      cityId
    );
  }

  /**
   * Get monthly prayer times for current month
   */
  getCurrentMonthPrayerTimes(
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<MonthlyPrayerTimesResult | null> {
    const now = new Date();
    return this.apiService
      .getMonthlyPrayerTimesByGregorian(
        now.getFullYear(),
        now.getMonth() + 1,
        longitude,
        latitude,
        cityId
      )
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get monthly prayer times by Gregorian calendar
   */
  getMonthlyPrayerTimesByGregorian(
    gregorianYear: number,
    gregorianMonth: number,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<CommonResponse<MonthlyPrayerTimesResult>> {
    return this.apiService.getMonthlyPrayerTimesByGregorian(
      gregorianYear,
      gregorianMonth,
      longitude,
      latitude,
      cityId
    );
  }

  /**
   * Get monthly prayer times by Hijri calendar
   */
  getMonthlyPrayerTimesByHijri(
    hijriYear: number,
    hijriMonth: number,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<CommonResponse<MonthlyPrayerTimesResult>> {
    return this.apiService.getMonthlyPrayerTimesByHijri(
      hijriYear,
      hijriMonth,
      longitude,
      latitude,
      cityId
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
