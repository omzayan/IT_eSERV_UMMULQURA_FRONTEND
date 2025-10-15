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
import { City } from '../../../core/types/api.types';

export interface LocationData {
  lat?: number | null;
  lng?: number | null;
  city?: string;
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
  @Output() locationSelect = new EventEmitter<LocationData>();
  @Output() citySelect = new EventEmitter<City>();

  private destroy$ = new Subject<void>();

  // Modal control
  isOpen: boolean = false;
  activeTab: 'city' | 'coords' = 'city';

  // city state
  cities: City[] = [];
  filteredCities: City[] = [];
  searchText: string = '';
  loadingCities: boolean = false;
  citiesError: string | null = null;
  selectedCityName: string = ''; // اسم المدينة المختارة

coords: LocationData = { lat: undefined, lng: undefined };


  constructor(
    private referenceDataService: ReferenceDataService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.fetchCities();
     // Debugging الترجمة
  const keysToCheck = [
    'citySelect.title',
    'citySelect.byCity',
    'citySelect.byCoords',
    'citySelect.currentLocation',
    'citySelect.selectCityPlaceholder'
  ];

  keysToCheck.forEach(key => {
    this.translate.get(key).subscribe(val => {
   
    });
  });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCities() {
    this.loadingCities = true;
    this.referenceDataService
      .getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apiCities: City[] | null) => {
          this.cities = apiCities ?? [];
          this.filteredCities = this.cities;
          this.loadingCities = false;
        },
        error: () => {
          this.citiesError = this.translate.instant('citySelect.citiesLoadError');
          this.loadingCities = false;
        },
      });
  }

  toggleModal() {
    this.isOpen = !this.isOpen;
  }

  filterCities() {
    const text = this.searchText.toLowerCase();
    this.filteredCities = this.cities.filter((c) =>
      (c.cityName ?? '').toLowerCase().includes(text)
    );
  }

 onCitySelect(city: City) {
  this.citySelect.emit(city);
  this.selectedCityName = city.cityName ?? ''; // يظهر مكان "اختر المدينة"
  this.isOpen = false;
}

onCoordsSelect() {
  if (this.coords.lat !== undefined && this.coords.lng !== undefined) {
    this.locationSelect.emit(this.coords);
    this.isOpen = false;
  }
}


  selectCurrentLocation() {
    if (!navigator.geolocation) {
      alert(this.translate.instant('citySelect.geolocationNotSupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.locationSelect.emit(this.coords);
        this.isOpen = false;
      },
      () => {
        alert(this.translate.instant('citySelect.locationError'));
      }
    );
  }
  reset() {
  this.searchText = '';
  this.filteredCities = this.cities;
  this.coords = { lat: 0, lng: 0 };
}


}
