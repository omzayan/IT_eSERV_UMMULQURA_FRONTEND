import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReferenceDataService } from '../../../core/services';
import { CityResult } from '../../../core/types/api.types';

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
}

export interface CityData {
  value: string;
  name: string;
  coordinates: { lat: number; lng: number };
}

@Component({
  selector: 'app-city-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './city-selector.component.html',
  styleUrls: ['./city-selector.component.css'],
})
export class CitySelectorComponent implements OnInit, OnDestroy {
  @Input() label?: string = 'citySelect.selectCity';
  @Input() disabled: boolean = false;
  @Output() locationSelect = new EventEmitter<LocationData>();
  @Output() citySelect = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  selectedCity: string = '';
  currentCoordinates: { lat: number; lng: number } | null = null;
  isGettingLocation: boolean = false;

  // Cities state
  cities: CityData[] = [];
  loadingCities: boolean = false;
  citiesError: string | null = null;

  constructor(
    private referenceDataService: ReferenceDataService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.fetchCities();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCities() {
    this.loadingCities = true;
    this.citiesError = null;

    this.referenceDataService
      .getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apiCities) => {
          // Map to expected format - assuming cities don't have coordinates in API
          // For now, we'll use placeholder coordinates or you can extend the API
          this.cities = apiCities.map((city: CityResult) => ({
            value: city.id.toString(),
            name: city.name,
            coordinates: { lat: 0, lng: 0 }, // TODO: Add actual coordinates from API
          }));
          this.loadingCities = false;
        },
        error: (error) => {
          console.error('Error fetching cities:', error);
          this.citiesError = this.translate.instant(
            'citySelect.citiesLoadError'
          );
          this.loadingCities = false;
        },
      });
  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const cityValue = target.value;
    this.selectedCity = cityValue;

    // Clear current coordinates when a city is selected
    this.currentCoordinates = null;

    if (cityValue) {
      // Only emit citySelect when a city is selected
      // Do NOT emit locationSelect to avoid conflict with city-based prayer times
      this.citySelect.emit(cityValue);
    }
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert(this.translate.instant('citySelect.geolocationNotSupported'));
      return;
    }

    this.isGettingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.isGettingLocation = false;

        // Store coordinates for display
        this.currentCoordinates = {
          lat: latitude,
          lng: longitude,
        };

        this.locationSelect.emit({
          lat: latitude,
          lng: longitude,
        });

        // Clear city selection when using current location
        this.selectedCity = '';
      },
      (error) => {
        this.isGettingLocation = false;
        console.error('Error getting location:', error);

        let errorMessage = this.translate.instant('citySelect.locationError');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = this.translate.instant('citySelect.locationDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = this.translate.instant(
              'citySelect.locationUnavailable'
            );
            break;
          case error.TIMEOUT:
            errorMessage = this.translate.instant('citySelect.locationTimeout');
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }

  reset() {
    this.selectedCity = '';
    this.currentCoordinates = null;
    // Don't emit events on reset to avoid infinite loops
  }
}
