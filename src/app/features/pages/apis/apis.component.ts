import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { ApisSidebarComponent } from '../../components/apis-sidebar/apis-sidebar.component';
import { FeedbackCardComponent } from '../../components/feedback-card/feedback-card.component';
import { PrayerTimeCardComponent } from '../../components/prayer-time-card/prayer-time-card.component';
import { Subscription } from 'rxjs';

interface BreadcrumbItem {
    label: string;
    href?: string;
    isActive?: boolean;
}

interface PrayerTime {
    title: string;
    description: string;
    times: string[];
    isActive?: boolean;
    statusLabel?: string;
    statusType?: 'upcoming' | 'missed';
}

@Component({
    selector: 'app-apis',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        BreadcrumbComponent,
        ApisSidebarComponent,
        FeedbackCardComponent,
        PrayerTimeCardComponent
    ],
    templateUrl: './apis.component.html',
    styleUrls: ['./apis.component.css']
})
export class ApisComponent implements OnInit, OnDestroy {
    breadcrumbItems: BreadcrumbItem[] = [];
    currentSlide = 0;
    totalSlides = 4;
    isRTL = false;

    prayers: PrayerTime[] = [];

    private langSubscription?: Subscription;

    constructor(private translate: TranslateService) { }

    ngOnInit() {
        this.setupBreadcrumb();
        this.loadPrayerTimes();
        this.setupLanguage();

        // Subscribe to language changes
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.setupBreadcrumb();
            this.loadPrayerTimes();
            this.setupLanguage();
        });
    }

    private setupLanguage() {
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
        this.isRTL = currentLang === 'ar';
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

    private setupBreadcrumb() {
        this.breadcrumbItems = [
            {
                label: this.translate.instant('apiPage.breadcrumb.home'),
                href: '/'
            },
            {
                label: this.translate.instant('apiPage.breadcrumb.api'),
                isActive: true
            }
        ];
    }

    private loadPrayerTimes() {
        this.prayers = [
            {
                title: this.translate.instant('prayers2.fajr.title'),
                description: this.translate.instant('prayers2.fajr.description'),
                times: ['04:12', '05:32'],
                isActive: true,
                statusLabel: 'فائتة',
                statusType: 'missed'
            },
            {
                title: this.translate.instant('prayers2.dhuhr.title'),
                description: this.translate.instant('prayers2.dhuhr.description'),
                times: ['12:47', '13:48'],
                statusLabel: 'قادمة',
                statusType: 'upcoming'
            },
            {
                title: this.translate.instant('prayers2.asr.title'),
                description: this.translate.instant('prayers2.asr.description'),
                times: ['16:21', '17:30'],
                statusLabel: 'قادمة',
                statusType: 'upcoming'
            },
            {
                title: this.translate.instant('prayers2.maghrib.title'),
                description: this.translate.instant('prayers2.maghrib.description'),
                times: ['19:02', '19:45'],
                statusLabel: 'قادمة',
                statusType: 'upcoming'
            },
            {
                title: this.translate.instant('prayers2.Ishaa.title'),
                description: this.translate.instant('prayers2.Ishaa.description'),
                times: ['19:02', '19:45'],
                statusLabel: 'قادمة',
                statusType: 'upcoming'
            }
        ];
    }

    // Slider functionality
    goNext() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
        }
    }

    goPrev() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
        }
    }

    goToSlide(index: number) {
        this.currentSlide = index;
    }

    // Event handlers
    onStartService() {
        console.log('Start service clicked');
    }

    onFeedbackClick() {
        console.log('Feedback button clicked');
    }

    onShowAllPrayers() {
        console.log('Show all prayers clicked');
    }

    onYesClick() {
        console.log('Yes feedback clicked');
    }

    onNoClick() {
        console.log('No feedback clicked');
    }

    onSendReviewClick() {
        console.log('Send review clicked');
    }
}
