import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  TranslateHttpLoader,
  TRANSLATE_HTTP_LOADER_CONFIG,
} from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { ToastrModule } from 'ngx-toastr';

// Import our interceptors
import { languageInterceptor } from './app/core/interceptors/language.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { BackendTranslateLoader } from './backend/translateLoader';

// Factory for translate HTTP loader
export function HttpLoaderFactory(http: HttpClient) {
  return new BackendTranslateLoader(http); // Make sure to pass http here
}

bootstrapApplication(AppComponent, {
  providers: [
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([languageInterceptor, errorInterceptor])
    ),

    // Animations for toastr
    provideAnimations(),

    // Router
    provideRouter(routes),

    // Configure where translation files are located
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json',
      },
    },

    // Import ngx-translate module
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'ar',
      })
    ),

    // Import Toastr module
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 5000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
      })
    ),
  ],
}).catch((err) => console.error(err));
