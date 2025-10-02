import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DigitalStampComponent } from './digital-stamp/digital-stamp.component';
import { SecondNavHeaderComponent } from './second-nav-header/second-nav-header.component';
import { MainNavHeaderComponent } from './main-nav-header/main-nav-header.component';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    DigitalStampComponent,
    SecondNavHeaderComponent,
    MainNavHeaderComponent,
  ],
})
export class HeaderComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Language initialization is now handled by the LanguageService
    // The service will automatically load the saved language from localStorage
    // or use the default language if none is saved
  }

  // Method to switch language (can be called from header or anywhere)
  switchLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }
}
