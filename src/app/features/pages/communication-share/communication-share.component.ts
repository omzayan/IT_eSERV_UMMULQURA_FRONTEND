import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { Subscription } from 'rxjs';

interface BreadcrumbItem {
    label: string;
    href?: string;
    isActive?: boolean;
}

interface ServiceData {
    id: number;
    title: string;
    icon?: string;
    onClick: () => void;
}

@Component({
    selector: 'app-communication-share',
    standalone: true,
      imports: [
    CommonModule,
    TranslateModule,
    BreadcrumbComponent,
    ServiceCardComponent
  ],
    templateUrl: './communication-share.component.html',
    styleUrls: ['./communication-share.component.css']
})
export class CommunicationShareComponent implements OnInit, OnDestroy {
    breadcrumbItems: BreadcrumbItem[] = [];
    servicesData: ServiceData[] = [];
    isRTL = false;

    private langSubscription?: Subscription;

    constructor(
        private translate: TranslateService,
        private router: Router
    ) { }

    ngOnInit() {
        this.setupBreadcrumb();
        this.setupServicesData();
        this.setupLanguage();

        // Subscribe to language changes
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.setupBreadcrumb();
            this.setupServicesData();
            this.setupLanguage();
        });
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

    private setupLanguage() {
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
        this.isRTL = currentLang === 'ar';
    }

    private setupBreadcrumb() {
        this.breadcrumbItems = [
            {
                label: this.translate.instant('communicationShare.breadcrumb.home'),
                href: '/'
            },
            {
                label: this.translate.instant('communicationShare.breadcrumb.about'),
                href: '/about-us'
            },
            {
                label: this.translate.instant('communicationShare.breadcrumb.communicationShare'),
                isActive: true
            }
        ];
    }

    private setupServicesData() {
        this.servicesData = [
            {
                id: 1,
                title: this.translate.instant('communicationShare.topics.title1'),
                onClick: () => console.log('Strategy clicked')
            },
            {
                id: 2,
                title: this.translate.instant('communicationShare.topics.title2'),
                onClick: () => console.log('Organizational Structure clicked')
            },
            {
                id: 3,
                title: this.translate.instant('communicationShare.topics.title3'),
                onClick: () => this.router.navigate(['/about-us-details'])
            },
            {
                id: 4,
                title: this.translate.instant('communicationShare.topics.title4'),
                onClick: () => console.log('E-Participation clicked')
            },
            {
                id: 5,
                title: this.translate.instant('communicationShare.topics.title5'),
                onClick: () => console.log('Tenders and Procurements clicked')
            },
            {
                id: 6,
                title: this.translate.instant('communicationShare.topics.title6'),
                onClick: () => console.log('Budget and Expenditures clicked')
            },
            {
                id: 7,
                title: this.translate.instant('communicationShare.topics.title7'),
                onClick: () => console.log('Careers clicked')
            },
            {
                id: 8,
                title: this.translate.instant('communicationShare.topics.title8'),
                onClick: () => console.log('Sustainable Development clicked')
            }
        ];
    }

    onServiceClick(service: ServiceData) {
        service.onClick();
    }

    onYesClick() {
        console.log('Yes clicked');
    }

    onNoClick() {
        console.log('No clicked');
    }
}
