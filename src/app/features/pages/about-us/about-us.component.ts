import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbComponent } from '../../../features/shared/breadcrumb/breadcrumb.component';
import { ServiceCardComponent } from '../../../features/shared/service-card/service-card.component';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BreadcrumbComponent,
    ServiceCardComponent,
  ],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
})
export class AboutUsComponent implements OnInit, OnDestroy {
  isRtl = false;
  private destroy$ = new Subject<void>();

  serviceCards = [
    {
      titleKey: 'services.strategy',
      icon: 'strategy',
    },
    {
      titleKey: 'services.orgStructure',
      icon: 'hierarchy-square-02',
    },
    {
      titleKey: 'services.aboutUs',
      icon: 'information-diamond',
    },
    {
      titleKey: 'services.eParticipation',
      icon: 'user-group',
    },
    {
      titleKey: 'services.tenders',
      icon: 'validation-approval',
    },
    {
      titleKey: 'services.budget',
      icon: 'money-04',
    },
    {
      titleKey: 'services.careers',
      icon: 'briefcase-06',
    },
    {
      titleKey: 'services.sustainability',
      icon: 'plant-01',
    },
    {
      titleKey: 'services.partners',
      icon: 'city-02',
    },
    {
      titleKey: 'services.contact',
      icon: 'contact-02',
    },
    {
      titleKey: 'services.news',
      icon: 'news-01',
    },
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

  // Group cards into rows of 3
  get cardRows() {
    const rows = [];
    for (let i = 0; i < this.serviceCards.length; i += 3) {
      rows.push(this.serviceCards.slice(i, i + 3));
    }
    return rows;
  }
}
