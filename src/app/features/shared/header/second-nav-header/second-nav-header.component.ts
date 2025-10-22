import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  DateTimeService,
  DateTimeInfo,
} from '../../../../core/services/datetime.service';
import {
  CalendarIconComponent,
  ClockIconComponent,
  EyeIconComponent,
  FontSizeControlComponent,
  LocationIconComponent,
  MicrophoneIconComponent,
  SearchIconComponent,
  SearchIconComponent2,
  WeatherIconComponent,
} from '../icons/header-icons.component';
import { TranslateService } from '@ngx-translate/core';

interface WeatherInfo {
  location: string;
  weather: string;
}

@Component({
  selector: 'app-second-nav-header',
  standalone: true,
  imports: [
    CommonModule,
    CalendarIconComponent,
    ClockIconComponent,
    EyeIconComponent,
    LocationIconComponent,
    MicrophoneIconComponent,
    SearchIconComponent,
    SearchIconComponent2,
    WeatherIconComponent,
    FontSizeControlComponent,
  ],
  template: `
  <div class="w-100">
    <div
      class="flex  h-8 sm:h-10 px-4 sm:px-6 lg:px-8 flex-col justify-center border-t border-gray-300 bg-gray-100"
    >
    <div class="container mx-auto">
      <div class=" flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-4 flex-1 overflow-x-auto">
          <div
            class="flex items-center gap-1 sm:gap-2 flex-shrink-0"
            *ngIf="weatherInfo.weather"
          >
            <app-weather-icon
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              [style.fill]="'#384250'"
            ></app-weather-icon>
            <span
              class="text-gray-600 text-xs sm:text-sm lg:text-base font-normal font-ibm-plex-arabic whitespace-nowrap"
            >
              {{ weatherInfo.weather }}
            </span>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <app-location-icon
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              [style.fill]="'#384250'"
            ></app-location-icon>
            <span
              class="text-gray-600 text-xs sm:text-sm lg:text-base font-normal font-ibm-plex-arabic whitespace-nowrap"
            >
              {{ weatherInfo.location }}
            </span>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <app-clock-icon
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              [style.fill]="'#384250'"
            ></app-clock-icon>
            <span
              class="text-gray-600 text-xs sm:text-sm lg:text-base font-normal font-ibm-plex-arabic whitespace-nowrap"
            >
              {{ dateTime.time }}
            </span>
          </div>

          <div class="hidden sm:flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <app-calendar-icon
              class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              [style.fill]="'#384250'"
            ></app-calendar-icon>
            <span
              class="text-gray-600 text-xs sm:text-sm lg:text-base font-normal font-ibm-plex-arabic whitespace-nowrap"
            >
              {{ dateTime.date }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
            <app-eye-icon
            class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 "
          ></app-eye-icon>

          <app-search-icon
            class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 hidden"
          ></app-search-icon>

             <app-search-icon2
            class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 hidden"
          ></app-search-icon2>
        
          <app-font-size-control className="custom-class"></app-font-size-control>
     
   <app-microphone-icon
            class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 "
          ></app-microphone-icon>
        </div>
      </div>
         </div>
    </div>
      </div>
  `,
})
export class SecondNavHeaderComponent implements OnInit, OnDestroy {
  dateTime: DateTimeInfo = { time: '', date: '' };
  weatherInfo: WeatherInfo = {
    location: '',
    weather: '', // This could be fetched from an API
  };

  private subscription: Subscription = new Subscription();
  currentLang: string = 'ar';
  constructor(private dateTimeService: DateTimeService, private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
  }

  ngOnInit(): void {
    this.subscription.add(
      this.dateTimeService.getDateTime().subscribe((dateTime) => {
        this.dateTime = dateTime;
      })
    );
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.getLocation();
    });
    this.getLocation();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const country = await this.getCountryName(lat, lon);
          this.weatherInfo.location = country;

        },
      );
    } else {
      this.weatherInfo.location = 'Geolocation Not Supported';
    }
  }

  private async getCountryName(lat: number, lon: number): Promise<string> {
    const lang = this.currentLang === 'ar' ? 'ar' : 'en';

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': lang }
    });
    const data = await response.json();

    return data.address.country || 'Not Available';
  }

}
