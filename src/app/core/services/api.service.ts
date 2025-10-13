import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, switchMap, throwError } from 'rxjs';
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
  City,
  PrayerTimesResult,
  PrayerTimesBetweenDatesInput,
  WeekDayDto,
} from '../types/api.types';
import { ApiResponse } from '../types/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

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
            `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesForDurationByHijriDate`,
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
      `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesForDurationByHijriDate`,
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
  hijriYear: number,
  hijriMonth: number,
  latitude: number = 24.67,
  longitude: number = 46.69
): Observable<BaseResponse<MonthPrayerTimes>> {
  const body = { year: hijriYear, month: hijriMonth, latitude, longitude };
 return this.http.get<BaseResponse<MonthPrayerTimes>>(
  `${this.baseUrl}api/services/app/PrayerTimes/GetMonthPrayerTimesByHijriDate?year=${hijriYear}&month=${hijriMonth}&latitude=${latitude}&longitude=${longitude}`
);

}

// الميلادي: بس بيحوّله لهجري الأول
getMonthlyPrayerTimesByGregorian(
  gregorianYear: number,
  gregorianMonth: number,
  latitude: number = 24.67,
  longitude: number = 46.69
): Observable<BaseResponse<MonthPrayerTimes>> {
  const input: GregorianDateInput = {
    day: 1,
    month: gregorianMonth,
    year: gregorianYear
  };

  return this.convertGregorianToHijri(input).pipe(
    switchMap((response: BaseResponse<Result>) => {
      if (response.success && response.result) {
        return this.getMonthlyPrayerTimesByHijri(
          response.result.year,
          response.result.month,
          latitude,
          longitude
        );
      }
      return throwError(() => new Error('Failed to convert Gregorian to Hijri'));
    })
  );
}



  // ==================== CALENDAR SERVICES ====================

  /**
   * Get calendar for a full year
   */

  getCalendar(
    hijriYear: number,
    longitude?: number,
    latitude?: number,
    cityId?: number
  ): Observable<BaseResponse<PrayerTimesResult>> {
    let params = new HttpParams().set('Year', hijriYear.toString());

    if (longitude !== undefined)
      params = params.set('longitude', longitude.toString());
    if (latitude !== undefined)
      params = params.set('latitude', latitude.toString());
    if (cityId !== undefined)
      params = params.set('cityId', cityId.toString());

    return this.http.get<BaseResponse<PrayerTimesResult>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetYearPrayerTimesByHijriDate`,
      { params }
    );
  }

  ///https://localhost:44311/api/services/app/PrayerTimes/GetYearPrayerTimes?Year=1400&Longitude=120&Latitude=30
  /**
   * Get calendar for a Gregorian date range
   */
  getGregorianDateRangeCalendar(
    startDate: Date,
    endDate: Date,
    longitude?: number,
    latitude?: number
  ): Observable<BaseResponse<DurationPrayerTimes>> {

    return new Observable<BaseResponse<DurationPrayerTimes>>(observer => {
      // حوّل التاريخ الأول
      this.convertGregorianToHijri({
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate()
      }).subscribe(fromResp => {
        // حوّل التاريخ التاني
        this.convertGregorianToHijri({
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }).subscribe(toResp => {

          if (!fromResp.success || !toResp.success) {
            observer.error('Conversion failed');
            return;
          }

          // نجهز input زي getHijriDateRangeCalendar
          const input: PrayerTimesBetweenDatesInput = {
            fromHijriYear: fromResp.result.year,
            fromHijriMonth: fromResp.result.month,
            fromHijriDay: fromResp.result.day,
            toHijriYear: toResp.result.year,
            toHijriMonth: toResp.result.month,
            toHijriDay: toResp.result.day,
            longitude: longitude ?? 0,
            latitude: latitude ?? 0
          };

          // نجهز الـ params زي الهجري
          let params = new HttpParams()
            .set('fromHijriYear', input.fromHijriYear.toString())
            .set('fromHijriMonth', input.fromHijriMonth.toString())
            .set('fromHijriDay', input.fromHijriDay.toString())
            .set('toHijriYear', input.toHijriYear.toString())
            .set('toHijriMonth', input.toHijriMonth.toString())
            .set('toHijriDay', input.toHijriDay.toString())
            .set('longitude', input.longitude.toString())
            .set('latitude', input.latitude.toString());

          // ننده نفس الـ endpoint بتاع الهجري
          this.http.get<BaseResponse<DurationPrayerTimes>>(
            `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesDateRangeByHijriDates`,
            { params }
          ).subscribe({
            next: res => {
              observer.next(res);
              observer.complete();
            },
            error: err => observer.error(err)
          });

        });
      });
    });
  }



  /**
   * Get calendar for a Hijri date range
   */


  getHijriDateRangeCalendar(input: PrayerTimesBetweenDatesInput): Observable<BaseResponse<DurationPrayerTimes>> {
    const params = new HttpParams()
      .set('fromHijriYear', input.fromHijriYear.toString())
      .set('fromHijriMonth', input.fromHijriMonth.toString())
      .set('fromHijriDay', input.fromHijriDay.toString())
      .set('toHijriYear', input.toHijriYear.toString())
      .set('toHijriMonth', input.toHijriMonth.toString())
      .set('toHijriDay', input.toHijriDay.toString())
      .set('longitude', input.longitude.toString())
      .set('latitude', input.latitude.toString());

    return this.http.get<BaseResponse<DurationPrayerTimes>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetPrayerTimesDateRangeByHijriDates`,
      { params }
    );
  }


  // ==================== QIBLA & LOCATION SERVICES ====================

  /**
   * Get Qibla direction
   */
  getQibla(
    longitude: number,
    latitude: number
  ): Observable<BaseResponse<QiblaResult>> {
    let params = new HttpParams()
      .set('Longitude', longitude.toString())
      .set('Latitude', latitude.toString());

    return this.http.get<BaseResponse<QiblaResult>>(
      `${this.baseUrl}api/services/app/Qiblah/GetGoeNorthQiblah`,
      { params }
    );
  }



  /**
   * Get prayer times for all cities
   */
 
 getCitiesByCountry(country: string): Observable<City[] | null> {
    const params = new HttpParams().set('country', country);

    return this.http
      .get<BaseResponse<City[]>>(
        `${this.baseUrl}api/services/app/CityService/GetCitiesByCountry`,
        { params }
      )
      .pipe(map((res) => (res.success ? res.result : null)));
  }

  // ==================== REFERENCE DATA SERVICES ====================

  /**
   * Get week days
   */
 // core/services/api.service.ts
getWeekDays(): Observable<WeekDayDto[]> {
  return this.http
    .get<BaseResponse<WeekDayDto[]>>(`${this.baseUrl}api/services/app/Months/GetWeekDays`)
    .pipe(map(res => (res.success && res.result ? res.result : [])));
}


  /**
   * Get Gregorian months
   */
  // core/services/api.service.ts
getGregorianMonths(): Observable<any> {
  return this.http.get<any>(
    `${environment.apiBaseUrl}api/services/app/Months/GetGregorianMonths`
  );
}

  /**
   * Get Hijri months
   */
 // core/services/api.service.ts
getHijriMonths(): Observable<any> {
  return this.http.get<any>(
    `${environment.apiBaseUrl}api/services/app/Months/GetHijriMonths`
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

  // api.service.ts

 getBanners() {
    return this.http.get<any>(`${environment.apiBaseUrl}api/services/app/Banner/GetList`);
  }

 // core/api.service.ts
getPartners() {
  return this.http.get<any>(`${this.baseUrl}api/services/app/Partner/GetList`);
}

getAttachment(id: number) {
 
  return this.http.get<any>(`${this.baseUrl}api/services/app/PartnerAttachment/GetAttachment`, {
    params: { id }
  });
}


}
