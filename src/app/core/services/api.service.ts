import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
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
  BaseResponse,
  Result,
  GregorianDateInput,
  HijriDateInput,
  MonthPrayerTimes,
  DurationPrayerTimes,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  // ==================== DATE CONVERSION SERVICES ====================

  /**
   * Convert Gregorian date to Hijri
   */

convertGregorianToHijri(
  input: GregorianDateInput
): Observable<BaseResponse<Result>> {
  return this.http.post<BaseResponse<Result>>(
    `${this.baseUrl}api/services/app/DateConversion/GregorianToHijri`,
    input
  );
}

convertHijriToGregorian(
  input: HijriDateInput
): Observable<BaseResponse<Result>> {
  return this.http.post<BaseResponse<Result>>(
    `${this.baseUrl}api/services/app/DateConversion/HijriToGregorian`,
    input
  );
}



  // ==================== PRAYER TIMES SERVICES ====================

  /**
   * Get prayer times for a specific Gregorian date
   */
getDateWithPrayerTimesGregorian(
  gregorianDate: Date,
  longitude: number,
  latitude: number,
  cityId?: number
): Observable<BaseResponse<DurationPrayerTimes>> {
  const input: GregorianDateInput = {
    day: gregorianDate.getDate(),
    // ✅ خلي بالك إن getMonth بيرجع 0-based → لازم نزود +1
    month: gregorianDate.getMonth() + 1,
    year: gregorianDate.getFullYear(),
  };

  return this.convertGregorianToHijri(input).pipe(
    switchMap((response) => {
      if (response.success && response.result) {
        const hijri = response.result;

        return this.http.get<BaseResponse<DurationPrayerTimes>>(
          `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesForDuration`,
          {
            params: {
              Year: hijri.year.toString(),
              Month: hijri.month.toString(),
              Day: hijri.day.toString(),
              Duration: '1',
              Latitude: latitude.toString(),
              Longitude: longitude.toString(),
            },
          }
        );
      } else {
        return throwError(
          () => new Error(response.error?.message || 'Conversion failed')
        );
      }
    })
  );
}

getDateWithPrayerTimesHijri(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number
): Observable<BaseResponse<DurationPrayerTimes>> {
  return this.http.get<BaseResponse<DurationPrayerTimes>>(
    `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesForDuration`,
    {
      params: {
        Year: year.toString(),
        Month: month.toString(),
        Day: day.toString(),
        Duration: '1',
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
    }
  );
}



  /**
   * Get prayer times for a specific Hijri date
   */



  /**
   * Get monthly prayer times by Hijri calendar
   */


getMonthlyPrayerTimesByHijri(
  gregorianYear: number,
  gregorianMonth: number,
  latitude: number = 24.67,
  longitude: number = 46.69
): Observable<BaseResponse<MonthPrayerTimes>> {
  const input: GregorianDateInput = {
    day: 1, // نختار أول يوم في الشهر
    month: gregorianMonth,
    year: gregorianYear,
  };

  return this.convertGregorianToHijri(input).pipe(
    switchMap((response: BaseResponse<Result>) => {
      if (response.success && response.result) {
        const hijriYear = response.result.year;
        const hijriMonth = response.result.month;

        const body = {
          year: hijriYear,
          month: hijriMonth,
          latitude,
          longitude,
        };

        return this.http.post<BaseResponse<MonthPrayerTimes>>(
          `${this.baseUrl}api/services/app/PrayerTimes/GetMonthPrayerTimes`,
          body
        );
      }

    
      return throwError(() => new Error('Failed to convert Gregorian to Hijri'));
    })
  );
}

  getMonthlyPrayerTimesByGregorian(
  year: number,
  month: number,
  latitude: number = 24.67,
  longitude: number = 46.69
): Observable<BaseResponse<MonthPrayerTimes>> {
  const body = {
    year,
    month,
    latitude,
    longitude
  };

  return this.http.post<BaseResponse<MonthPrayerTimes>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetMonthPrayerTimes`,
    body
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
