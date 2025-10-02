import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CommonResponse,
  DateConversionResult,
  PrayerTimeWithDateResult,
  MonthlyPrayerTimesResult,
  CalendarYearResult,
  QiblaResult,
  PrayerTimesByCitiesResult,
  WeekDayResult,
  MonthResult,
  CityResult,
  AppSettingResult,
  StaticPageResult,
  CalendarDayResult,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}Api`;

  constructor(private http: HttpClient) {}

  // ==================== DATE CONVERSION SERVICES ====================

  /**
   * Convert Gregorian date to Hijri
   */
  convertGregorianToHijri(
    date: Date
  ): Observable<CommonResponse<DateConversionResult>> {
    const params = new HttpParams().set('date', date.toISOString());
    return this.http.get<CommonResponse<DateConversionResult>>(
      `${this.baseUrl}/ConvertGregorianToHirji`,
      { params }
    );
  }

  /**
   * Convert Hijri date to Gregorian
   */
  convertHijriToGregorian(
    date: Date
  ): Observable<CommonResponse<DateConversionResult>> {
    const params = new HttpParams().set('date', date.toISOString());
    return this.http.get<CommonResponse<DateConversionResult>>(
      `${this.baseUrl}/ConvertHirjiToGregorian`,
      { params }
    );
  }

  // ==================== PRAYER TIMES SERVICES ====================

  /**
   * Get prayer times for a specific Gregorian date
   */
  getDateWithPrayerTimesGregorian(
    gregorianDate: Date,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<CommonResponse<PrayerTimeWithDateResult>> {
    let params = new HttpParams().set(
      'gregorianDate',
      gregorianDate.toISOString()
    );
    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined) params = params.set('cityId', cityId.toString());

    return this.http.get<CommonResponse<PrayerTimeWithDateResult>>(
      `${this.baseUrl}/GetDateWithPrayerTimesGregorian`,
      { params }
    );
  }

  /**
   * Get prayer times for a specific Hijri date
   */
  getDateWithPrayerTimesHijri(
    hijriDate: Date,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<CommonResponse<PrayerTimeWithDateResult>> {
    let params = new HttpParams().set('hijriDate', hijriDate.toISOString());
    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined) params = params.set('cityId', cityId.toString());

    return this.http.get<CommonResponse<PrayerTimeWithDateResult>>(
      `${this.baseUrl}/GetDateWithPrayerTimesHijri`,
      { params }
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
    let params = new HttpParams()
      .set('hijriYear', hijriYear.toString())
      .set('hijriMonth', hijriMonth.toString());

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined) params = params.set('cityId', cityId.toString());

    return this.http.get<CommonResponse<MonthlyPrayerTimesResult>>(
      `${this.baseUrl}/GetMonthlyPrayerTimesByHijri`,
      { params }
    );
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
    let params = new HttpParams()
      .set('gregorianYear', gregorianYear.toString())
      .set('gregorianMonth', gregorianMonth.toString());

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined) params = params.set('cityId', cityId.toString());

    return this.http.get<CommonResponse<MonthlyPrayerTimesResult>>(
      `${this.baseUrl}/GetMonthlyPrayerTimesByGregorian`,
      { params }
    );
  }

  // ==================== CALENDAR SERVICES ====================

  /**
   * Get calendar for a full year
   */
  getCalendar(
    hijriYear?: number,
    gregorianYear?: number,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<CommonResponse<CalendarYearResult>> {
    let params = new HttpParams();

    if (hijriYear !== undefined)
      params = params.set('hijriYear', hijriYear.toString());
    if (gregorianYear !== undefined)
      params = params.set('gregorianYear', gregorianYear.toString());
    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined) params = params.set('cityId', cityId.toString());

    return this.http.get<CommonResponse<CalendarYearResult>>(
      `${this.baseUrl}/GetCalendar`,
      { params }
    );
  }

  /**
   * Get calendar for a Gregorian date range
   */
  getGregorianDateRangeCalendar(
    startDate: Date,
    endDate: Date,
    longitude?: number,
    latitude?: number,
    cityNumber?: number
  ): Observable<CommonResponse<CalendarDayResult>> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityNumber !== undefined)
      params = params.set('cityNumber', cityNumber.toString());

    return this.http.get<CommonResponse<CalendarDayResult>>(
      `${this.baseUrl}/GetGregorianDateRangeCalendar`,
      { params }
    );
  }

  /**
   * Get calendar for a Hijri date range
   */
  getHijriDateRangeCalendar(
    startDate: Date,
    endDate: Date,
    longitude?: number,
    latitude?: number,
    cityNumber?: number
  ): Observable<CommonResponse<CalendarDayResult>> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityNumber !== undefined)
      params = params.set('cityNumber', cityNumber.toString());

    return this.http.get<CommonResponse<CalendarDayResult>>(
      `${this.baseUrl}/GetHijirDateRangeCalendar`,
      { params }
    );
  }

  // ==================== QIBLA & LOCATION SERVICES ====================

  /**
   * Get Qibla direction
   */
  getQibla(
    longitude?: number,
    latitude?: number,
    cityNumber?: number
  ): Observable<CommonResponse<QiblaResult>> {
    let params = new HttpParams();

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityNumber !== undefined)
      params = params.set('cityNumber', cityNumber.toString());

    return this.http.get<CommonResponse<QiblaResult>>(
      `${this.baseUrl}/GetQibla`,
      { params }
    );
  }

  /**
   * Get prayer times for all cities
   */
  getCitiesPrayerTimes(): Observable<
    CommonResponse<PrayerTimesByCitiesResult>
  > {
    return this.http.get<CommonResponse<PrayerTimesByCitiesResult>>(
      `${this.baseUrl}/GetCitiesPrayerTimes`
    );
  }

  // ==================== REFERENCE DATA SERVICES ====================

  /**
   * Get week days
   */
  getWeekDays(): Observable<CommonResponse<WeekDayResult[]>> {
    return this.http.get<CommonResponse<WeekDayResult[]>>(
      `${this.baseUrl}/GetWeekDays`
    );
  }

  /**
   * Get Gregorian months
   */
  getGregorianMonths(): Observable<CommonResponse<MonthResult[]>> {
    return this.http.get<CommonResponse<MonthResult[]>>(
      `${this.baseUrl}/GetGregorianMonths`
    );
  }

  /**
   * Get Hijri months
   */
  getHijriMonths(): Observable<CommonResponse<MonthResult[]>> {
    return this.http.get<CommonResponse<MonthResult[]>>(
      `${this.baseUrl}/GetHijirMonths`
    );
  }

  /**
   * Get available cities
   */
  getCities(): Observable<CommonResponse<CityResult[]>> {
    return this.http.get<CommonResponse<CityResult[]>>(
      `${this.baseUrl}/GetCities`
    );
  }

  // ==================== SETTINGS & STATIC CONTENT ====================

  /**
   * Get app settings
   */
  getAppSettings(): Observable<CommonResponse<AppSettingResult>> {
    return this.http.get<CommonResponse<AppSettingResult>>(
      `${this.baseUrl}/app-setting`
    );
  }

  /**
   * Get static page content
   */
  getStaticPage(
    pageLink: string
  ): Observable<CommonResponse<StaticPageResult>> {
    const params = new HttpParams().set('page_link', pageLink);
    return this.http.get<CommonResponse<StaticPageResult>>(
      `${this.baseUrl}/static_page`,
      { params }
    );
  }
}
