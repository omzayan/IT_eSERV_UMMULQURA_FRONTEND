import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  WeekDayResult,
  MonthResult,
  CityResult,
  AppSettingResult,
  StaticPageResult,
  City,
  WeekDayDto,
} from '../types/api.types';

/**
 * Reference data service - convenience wrapper for static/reference data API calls
 */
@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all week days
   */
// core/services/reference-data.service.ts
getWeekDays(): Observable<WeekDayDto[]> {
  return this.apiService.getWeekDays();
}


  /**
   * Get Gregorian months
   */
getGregorianMonths(): Observable<MonthResult[]> {
  return this.apiService
    .getGregorianMonths()
    .pipe(
      map((response: any) =>
        response.success && response.result
          ? response.result.map((m: any) => ({
              month_number: m.id.toString(),
              month_name: m.name
            }))
          : []
      )
    );
}

getHijriMonths(): Observable<MonthResult[]> {
  return this.apiService
    .getHijriMonths()
    .pipe(
      map((response: any) =>
        response.success && response.result
          ? response.result.map((m: any) => ({
              month_number: m.id.toString(),
              month_name: m.name
            }))
          : []
      )
    );
}


  /**
   * Get all available cities
   */
 
  getCities(): Observable<City[] | null> {
    const country = "SaudiArabia"; // أو "السعودية" على حسب الـ API
    return this.apiService.getCitiesByCountry(country).pipe(
      map((cities) => (cities && cities.length > 0 ? cities : null))
    );
  }
  /**
   * Get application settings
   */
  // getAppSettings(): Observable<AppSettingResult | null> {
  //   return this.apiService
  //     .getAppSettings()
  //     .pipe(map((response) => (response.success ? response.data : null)));
  // }

  /**
   * Get static page content
   */
  // getStaticPage(pageLink: string): Observable<StaticPageResult | null> {
  //   return this.apiService
  //     .getStaticPage(pageLink)
  //     .pipe(map((response) => (response.success ? response.data : null)));
  // }
}
