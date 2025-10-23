import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CommonResponse,
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
  CityResult,
  AppSettingResult,
  StaticPageResult,
  QiblaResult,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /** Convert Gregorian date to Hijri */
convertGregorianToHijri(
  input: GregorianDateInput
): Observable<BaseResponse<Result>> {
  return this.http.post<BaseResponse<Result>>(
    `${this.baseUrl}api/services/app/DateConversion/GregorianToHijri`,
    input
  );
}

/** Convert Hijri date to Gregorian */
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
    latitude: number
  ): Observable<BaseResponse<DurationPrayerTimes>> {
    return this.http.get<BaseResponse<DurationPrayerTimes>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetForDurationByGregorianDate`,
      {
        params: {
          StartDate: gregorianDate.toISOString(),
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
  getDateWithPrayerTimesHijri(
    year: number,
    month: number,
    day: number,
    latitude: number,
    longitude: number
  ): Observable<BaseResponse<DurationPrayerTimes>> {
    return this.http.get<BaseResponse<DurationPrayerTimes>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetForDurationByHijriDate`,
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
   * Get monthly prayer times by Hijri
   */
  getMonthlyPrayerTimesByHijri(
    hijriYear: number,
    hijriMonth: number,
    latitude: number = 21.42,
    longitude: number = 39.83
  ): Observable<BaseResponse<MonthPrayerTimes>> {
    return this.http.get<BaseResponse<MonthPrayerTimes>>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetMonthByHijriDate`,
      {
        params: {
          Year: hijriYear.toString(),
          Month: hijriMonth.toString(),
          Latitude: latitude.toString(),
          Longitude: longitude.toString(),
        },
      }
    );
  }

  /**
   * Get monthly prayer times by Gregorian
   */
 getMonthlyPrayerTimesByGregorian(
  gregorianYear: number,
  gregorianMonth: number,
  latitude: number = 21.42,
  longitude: number = 39.83
): Observable<BaseResponse<MonthPrayerTimes>> {
  return this.http.get<BaseResponse<MonthPrayerTimes>>(
    `${this.baseUrl}api/services/app/PrayerTimes/GetMonthlyByGregorianDate`,
    {
      params: {
        Year: gregorianYear.toString(),
        Month: gregorianMonth.toString(),
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
    }
  );
}
/** 
 * Get week days 
 */
// core/services/api.service.ts
getWeekDays(): Observable<WeekDayDto[]> {
  return this.http
    .get<BaseResponse<WeekDayDto[]>>(
      `${this.baseUrl}api/services/app/Months/GetWeekDays`
    )
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
 * Get calendar for a full year 
 */
getCalendar(
  hijriYear: number,
  longitude?: number,
  latitude?: number,
  cityId?: number
): Observable<BaseResponse<PrayerTimesResult>> {
  let params = new HttpParams().set('Year', hijriYear.toString());

  if (longitude !== undefined) {
    params = params.set('Longitude', longitude.toString());
  }
  if (latitude !== undefined) {
    params = params.set('Latitude', latitude.toString());
  }
  if (cityId !== undefined) {
    params = params.set('CityId', cityId.toString());
  }

  return this.http.get<BaseResponse<PrayerTimesResult>>(
    `${this.baseUrl}api/services/app/PrayerTimes/GetYearlyByHijriYear`,
    { params }
  );
}
getBanners() {
  return this.http.get<any>(
    `${environment.apiBaseUrl}api/services/app/Banner/GetList`
  );
}

// core/api.service.ts
getPartners() {
  return this.http.get<any>(
    `${this.baseUrl}api/services/app/Partner/GetList`
  );
}

getAttachment(id: number) {
  return this.http.get<any>(
    `${this.baseUrl}api/services/app/PartnerAttachment/GetAttachment`,
    { params: { id } }
  );
}

getBannerAttachment(id: number) {
  return this.http.get<any>(
    `${this.baseUrl}api/services/app/BannerAttachment/GetAttachment`,
    { params: { id } }
  );
}

  /**
   * Get calendar for a Hijri date range
   */
  getHijriDateRangeCalendar(
    input: PrayerTimesBetweenDatesInput
  ): Observable<BaseResponse<DurationPrayerTimes>> {
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
      `${this.baseUrl}api/services/app/PrayerTimes/GetDateRangeByHijriDate`,
      { params }
    );
  }

  /** * Get calendar for a Gregorian date range */
   getGregorianDateRangeCalendar(
  startDate: Date,
  endDate: Date,
  longitude?: number,
  latitude?: number
): Observable<BaseResponse<DurationPrayerTimes>> {
  return new Observable<BaseResponse<DurationPrayerTimes>>(observer => {
    // ✅ حول التاريخ الأول
    this.convertGregorianToHijri({
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      day: startDate.getDate()
    }).subscribe(fromResp => {
      // ✅ حول التاريخ التاني
      this.convertGregorianToHijri({
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate()
      }).subscribe(toResp => {
        // ✅ تحقق من نجاح التحويل
        if (!fromResp.success || !toResp.success) {
          observer.error('Conversion failed');
          return;
        }

        // ✅ جهز input
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

        // ✅ جهز الـ params
        let params = new HttpParams()
          .set('fromHijriYear', input.fromHijriYear.toString())
          .set('fromHijriMonth', input.fromHijriMonth.toString())
          .set('fromHijriDay', input.fromHijriDay.toString())
          .set('toHijriYear', input.toHijriYear.toString())
          .set('toHijriMonth', input.toHijriMonth.toString())
          .set('toHijriDay', input.toHijriDay.toString())
          .set('longitude', input.longitude.toString())
          .set('latitude', input.latitude.toString());

        // ✅ ننده API
        this.http
          .get<BaseResponse<DurationPrayerTimes>>(
            `${this.baseUrl}api/services/app/PrayerTimes/GetDateRangeByHijriDate`,
            { params }
          )
          .subscribe({
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


  // ==================== QIBLA & LOCATION ====================

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

  getPrayerTimesForAllCities(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}api/services/app/PrayerTimes/GetCountryCities`
    );
  }

  getCitiesByCountry(country: string): Observable<City[] | null> {
    const params = new HttpParams().set('country', country);
    return this.http
      .get<BaseResponse<City[]>>(
        `${this.baseUrl}api/services/app/CityService/GetCitiesByCountry`,
        { params }
      )
      .pipe(map((res) => (res.success ? res.result : null)));
  }


}
