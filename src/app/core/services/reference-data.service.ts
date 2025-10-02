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
  getWeekDays(): Observable<WeekDayResult[]> {
    return this.apiService
      .getWeekDays()
      .pipe(
        map((response) =>
          response.success && response.data ? response.data : []
        )
      );
  }

  /**
   * Get Gregorian months
   */
  getGregorianMonths(): Observable<MonthResult[]> {
    return this.apiService
      .getGregorianMonths()
      .pipe(
        map((response) =>
          response.success && response.data ? response.data : []
        )
      );
  }

  /**
   * Get Hijri months
   */
  getHijriMonths(): Observable<MonthResult[]> {
    return this.apiService
      .getHijriMonths()
      .pipe(
        map((response) =>
          response.success && response.data ? response.data : []
        )
      );
  }

  /**
   * Get all available cities
   */
  getCities(): Observable<CityResult[]> {
    return this.apiService
      .getCities()
      .pipe(
        map((response) =>
          response.success && response.data ? response.data : []
        )
      );
  }

  /**
   * Get application settings
   */
  getAppSettings(): Observable<AppSettingResult | null> {
    return this.apiService
      .getAppSettings()
      .pipe(map((response) => (response.success ? response.data : null)));
  }

  /**
   * Get static page content
   */
  getStaticPage(pageLink: string): Observable<StaticPageResult | null> {
    return this.apiService
      .getStaticPage(pageLink)
      .pipe(map((response) => (response.success ? response.data : null)));
  }
}
