import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import {
  MissionIconComponent,
  VisionIconComponent,
  SmartDevicesIconComponent,
  EasyDesignIconComponent,
  AstronomicalIconComponent,
  ApprovalIconComponent
} from '../../shared/icons/about-us-icons.component';
import { Subscription } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-about-us-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BreadcrumbComponent,
    MissionIconComponent,
    VisionIconComponent,
    SmartDevicesIconComponent,
    EasyDesignIconComponent,
    AstronomicalIconComponent,
    ApprovalIconComponent
  ],
  templateUrl: './about-us-details.component.html',
  styleUrl: './about-us-details.component.css'
})
export class AboutUsDetailsComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [];

  private langSubscription?: Subscription;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.setupBreadcrumb();

    // Subscribe to language changes
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.setupBreadcrumb();
    });
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private setupBreadcrumb() {
    this.breadcrumbItems = [
      {
        label: this.translate.instant('aboutUsDetails.breadcrumb.home'),
        href: '/'
      },
      {
        label: this.translate.instant('aboutUsDetails.breadcrumb.about'),
        href: '/about-us'
      },
      {
        label: this.translate.instant('aboutUsDetails.breadcrumb.whoWeAre'),
        isActive: true
      }
    ];
  }

  onFeatureClick() {
    // Handle feature card click
    console.log('Feature card clicked');
  }
}
