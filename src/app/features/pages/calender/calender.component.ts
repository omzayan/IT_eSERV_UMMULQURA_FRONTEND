import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

import { DailyPrayerTimesComponent } from '../../components/daily-prayer-times/daily-prayer-times.component';
import { DateConverterComponent } from '../../components/date-converter/date-converter.component';
import { UmmQuraCalenderComponent } from '../../components/umm-qura-calender/umm-qura-calender.component';

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DailyPrayerTimesComponent,
    DateConverterComponent,
    UmmQuraCalenderComponent,
  ],
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
})
export class CalenderComponent implements OnInit, OnDestroy {
  activeTab = 'prayTime';
  isRtl = false;
  private destroy$ = new Subject<void>();

  tabs = [
    { id: 'prayTime', labelKey: 'calendar.tabs.prayTime' },
    { id: 'umqurra', labelKey: 'calendar.tabs.umqurra' },
    { id: 'dateConverter', labelKey: 'calendar.tabs.dateConverter' },
  ];

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes using the language service
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.isRtl = language === 'ar';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleTabChange(tabId: string): void {
    this.activeTab = tabId;
  }
}
