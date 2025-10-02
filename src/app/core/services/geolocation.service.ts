import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  /**
   * Get current position using browser geolocation API
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error({
          code: 0,
          message: 'Geolocation is not supported by this browser.',
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          observer.complete();
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          observer.error({
            code: error.code,
            message: errorMessage,
          });
        },
        options
      );
    });
  }

  /**
   * Check if geolocation is supported
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Watch position changes (for continuous tracking)
   */
  watchPosition(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error({
          code: 0,
          message: 'Geolocation is not supported by this browser.',
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute cache for watch
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          observer.error({
            code: error.code,
            message: errorMessage,
          });
        },
        options
      );

      // Return cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }
}
