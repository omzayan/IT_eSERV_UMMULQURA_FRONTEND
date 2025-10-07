import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
  UserIconComponent,
  LanguageIconComponent,
  SearchIconComponent,
} from '../icons/header-icons.component';
import { LanguageService } from '../../../../core/services/language.service';

interface NavigationItem {
  key: string;
  translationKey: string;
  path?: string;
  hasDropdown?: boolean;
}

@Component({
  selector: 'app-main-nav-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    UserIconComponent,
    LanguageIconComponent,
    SearchIconComponent,
  ],
  template: `
    <div
      class="flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-white shadow-md min-h-[60px] sm:min-h-[72px]"
    >
      <div class="flex gap-2 sm:gap-4 items-center">
        <div class="flex items-center gap-2 sm:gap-4">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/5a51eafd14825dda7964f2551c46bc5ca5c476cd?width=200"
            alt="Ummulqura logo"
            class="h-8 sm:h-10 w-auto object-contain"
          />
        </div>

        <button
          class="flex h-[26px] sm:h-[30px] px-2 sm:px-4 justify-center items-center gap-1 rounded transition-colors bg-green-700 text-white hover:bg-green-800"
          (click)="navigate('/calender')"
        >
          <span class="text-sm sm:text-base font-medium font-ibm-plex-arabic">
            {{ 'header.calendar' | translate }}
          </span>
        </button>

        <div class="hidden md:flex items-center">
          <button
            *ngFor="let item of navigationItems"
            class="flex h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-200 bg-gray-50"
            (click)="navigateToItem(item)"
          >
            <svg
              *ngIf="item.hasDropdown"
              class="w-4 h-4 lg:w-5 lg:h-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5.5031 7.1294C5.60467 7.26388 5.90793 7.66534 6.08853 7.89676C6.45026 8.36027 6.94452 8.97618 7.47769 9.59026C8.01356 10.2074 8.57648 10.8085 9.07658 11.2504C9.32734 11.472 9.54762 11.6403 9.72939 11.7499C9.90035 11.853 10.0013 11.8744 10.0013 11.8744C10.0013 11.8744 10.0994 11.853 10.2703 11.7499C10.4521 11.6403 10.6724 11.472 10.9231 11.2504C11.4232 10.8085 11.9861 10.2074 12.522 9.59025C13.0552 8.97616 13.5494 8.36025 13.9112 7.89673C14.0918 7.66531 14.3946 7.26442 14.4962 7.12994C14.7009 6.852 15.0925 6.79206 15.3705 6.99675C15.6484 7.20145 15.7078 7.59269 15.5031 7.87063L15.5015 7.87273C15.395 8.01376 15.0809 8.42963 14.8966 8.66577C14.5267 9.13975 14.018 9.77384 13.4659 10.4098C12.9165 11.0426 12.3117 11.6915 11.7508 12.1871C11.471 12.4343 11.1875 12.6566 10.9157 12.8204C10.661 12.9739 10.3386 13.125 9.99985 13.125C9.66109 13.125 9.33868 12.9739 9.08404 12.8204C8.81223 12.6566 8.52866 12.4343 8.24891 12.1871C7.68798 11.6915 7.08325 11.0426 6.53382 10.4098C5.98169 9.77386 5.473 9.13978 5.1031 8.6658C4.91871 8.42953 4.60464 8.01371 4.4983 7.87292L4.4969 7.87107C4.2922 7.59313 4.35128 7.20149 4.62922 6.99679C4.90714 6.7921 5.2984 6.85149 5.5031 7.1294Z"
              />
            </svg>
            <span class="text-sm lg:text-base font-medium font-ibm-plex-arabic">
              {{ item.translationKey | translate }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex justify-end items-center gap-1 sm:gap-2">
        <button
          class="hidden lg:flex h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-50"
        >
          <app-user-icon class="w-5 h-5 lg:w-6 lg:h-6"></app-user-icon>
          <span class="text-sm lg:text-base font-medium font-ibm-plex-arabic">
            {{ 'header.login' | translate }}
          </span>
        </button>

       <div class="relative" (clickOutside)="closeDropdown()">
  <button
    class="flex h-[40px] sm:h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-50"
    (click)="toggleDropdown()"
  >
    <app-language-icon
      class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
    ></app-language-icon>
    <span
      class="hidden sm:inline text-sm lg:text-base font-medium font-ibm-plex-arabic"
    >
      {{
        currentLanguage
      }}
    </span>
    <svg
      class="w-4 h-4 lg:w-5 lg:h-5 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M5.5031 7.1294C5.60467 7.26388..."
      />
    </svg>
  </button>

  <!-- Dropdown menu -->
  <div
    *ngIf="dropdownOpen"
    class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50"
  >
    <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('en')"
    >
      English
    </button>
    <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('ar')"
    >
      العربية
    </button>

      <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('ch')"
    >
      الصينية
    </button>

     <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('Tu')"
    >
      التركية
    </button>
      <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('fr')"
    >
الفرنسية    </button>

     <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('Ad')"
    >
اردو    </button>

   <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('BN')"
    >
البنغالية   
 </button>

   <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('IN')"
    >
الاندونيسية   
 </button>
  </div>
</div>


        <button
          class="flex h-[40px] sm:h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-50"
        >
          <app-search-icon
            class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
          ></app-search-icon>
          <span
            class="hidden sm:inline text-sm lg:text-base font-medium font-ibm-plex-arabic"
          >
            {{ 'header.search' | translate }}
          </span>
        </button>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden flex h-[40px] w-[40px] justify-center items-center rounded transition-colors text-gray-900 hover:bg-gray-50"
          (click)="toggleMobileMenu()"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      class="md:hidden bg-white border-t border-gray-200"
      [class.hidden]="!showMobileMenu"
    >
      <div class="flex flex-col py-2">
        <button
          *ngFor="let item of navigationItems"
          class="flex px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors"
          (click)="navigateToItem(item); toggleMobileMenu()"
        >
          <span class="text-base font-medium font-ibm-plex-arabic">
            {{ item.translationKey | translate }}
          </span>
        </button>
        <div class="border-t border-gray-200 my-2"></div>
        <button
          class="flex px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <app-user-icon class="w-5 h-5 mr-2"></app-user-icon>
          <span class="text-base font-medium font-ibm-plex-arabic">
            {{ 'header.login' | translate }}
          </span>
        </button>
      </div>
    </div>
  `,
})
export class MainNavHeaderComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'ar';
  showMobileMenu: boolean = false;
  private destroy$ = new Subject<void>();

  navigationItems: NavigationItem[] = [
    {
      key: 'home',
      translationKey: 'header.home',
      path: '/',
    },
    {
      key: 'prayer-times',
      translationKey: 'header.prayerTimes',
      path: '/pray-time',
    },
    {
      key: 'about-us',
      translationKey: 'header.aboutUs',
      path: '/about-us',
    },
    {
      key: 'contact-us',
      translationKey: 'header.contactUs',
      path: '/contact-us',
    },
    {
      key: 'apis',
      translationKey: 'header.apis',
      path: '/apis',
    },
    {
      key: 'communication-share',
      translationKey: 'header.communicationShare',
      path: '/communication-share',
    },
    {
      key: 'about-us-details',
      translationKey: 'header.aboutUsDetails',
      path: '/about-us-details',
    },
  ];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.currentLanguage = language;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  navigateToItem(item: NavigationItem): void {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }

  toggleLanguage(lang:string): void {
    this.languageService.setLanguage(lang);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
  dropdownOpen = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

closeDropdown() {
  this.dropdownOpen = false;
}

setLanguage(lang: string) {
  this.currentLanguage = lang;
  this.translate.use(lang); // assuming you're using ngx-translate
  this.dropdownOpen = false;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
}
}
