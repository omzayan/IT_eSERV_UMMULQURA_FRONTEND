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
import { environment } from '../../../environments/environment';

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
    return this.apiService.getGregorianMonths().pipe(
      map((response: any) =>
        response && response.result
          ? response.result.map((m: any) => ({
              month_number: m.id.toString(),
              month_name: m.name,
            }))
          : []
      )
    );
  }


 getHijriMonths(): Observable<MonthResult[]> {
    return this.apiService.getHijriMonths().pipe(
      map((response: any) =>
        response && response.result
          ? response.result.map((m: any) => ({
              month_number: m.id.toString(),
              month_name: m.name,
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

 // core/services/reference-data.service.ts
getCityById(id: number): Observable<City | null> {
  return this.getCities().pipe(
    map(list => list?.find(c => c.id === id) ?? null)
  );
}

getCityCoords(id: number): Observable<{ lat: number; lng: number } | null> {
  return this.getCityById(id).pipe(
    map(city => {
      const lat = (city as any)?.lat;
      const lng = (city as any)?.lng;
      return (typeof lat === 'number' && typeof lng === 'number')
        ? { lat, lng }
        : null;
    })
  );
}


}
