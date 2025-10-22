import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // Add this import
import { Subject, takeUntil } from 'rxjs';
import {
  UserIconComponent,
  LanguageIconComponent,
  SearchIconComponent,
  SearchIconComponent2,
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
    FormsModule, // Add FormsModule here
    UserIconComponent,
    LanguageIconComponent,
    
   
  ],
  template: `
      <div class=" ">
    <div
      class="flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-white  min-h-[90px] sm:min-h-[90px]"
    >

  <div class="container mx-auto flex justify-between">

      <div class="flex gap-2 sm:gap-4 items-center">
        <div class="flex items-center gap-2 sm:gap-4">
       <img
    src="/assets/images/logo.svg"
    alt="Ummulqura logo"
    class="h-[75px] sm:h-[65px] w-auto object-contain"
  />
        </div>

        <button
          class="flex h-[60px] sm:h-[30px] px-2 sm:px-4 justify-center items-center gap-1 rounded transition-colors"
          [class]="currentRoute === '/calender' ? 'bg-green-800 text-white' : 'bg-green-700 text-white hover:bg-green-800'"
          (click)="navigate('/calender')"
        >
          <span class="text-sm sm:text-base font-medium font-ibm-plex-arabic">
            {{ 'header.calendar' | translate }}
          </span>
        </button>

        <div class="hidden md:flex items-center">
      <button
  *ngFor="let item of navigationItems"
  class="flex h-[60px] lg:h-[72px] px-2 lg:px-3 justify-center items-center gap-1 rounded transition-colors"
  [class]="isActive(item) ? 'bg-[#1b8354] text-white px-4 py-2 rounded-md [outline:2px_solid_#fff0!important] hover:bg-[#1b8354] ' : 'text-gray-900 hover:bg-gray-200 bg-gray-50 '"
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
      <!--
        <button
          class="hidden lg:flex h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-50"
        >
          <app-user-icon class="w-5 h-5 lg:w-6 lg:h-6"></app-user-icon>
          <span class="text-sm lg:text-base font-medium font-ibm-plex-arabic">
            {{ 'header.login' | translate }}
          </span>
        </button>
      -->

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
    <!--
    <svg
      class="w-4 h-4 lg:w-5 lg:h-5 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M5.5031 7.1294C5.60467 7.26388..."
      />
    </svg>
     -->
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
      {{ 'languages.english' | translate }}
    </button>
    <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('ar')"
    >
      {{ 'languages.arabic' | translate }}
    </button>

      <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('ch')"
    >
      {{ 'languages.chinese' | translate }}
    </button>

     <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('Tu')"
    >
      {{ 'languages.turkish' | translate }}
    </button>
      <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('fr')"
    >
{{ 'languages.french' | translate }}    </button>

     <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('Ad')"
    >
{{ 'languages.urdu' | translate }}    </button>

   <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('BN')"
    >
 {{ 'languages.bengali' | translate }}   
 </button>

   <button
      class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      (click)="setLanguage('IN')"
    >
{{ 'languages.indonesian' | translate }}   
 </button>
  </div>
</div>


    <!-- Search Button -->
    <button
      (click)="toggleSearch()"
      class="flex h-[40px] sm:h-[60px] lg:h-[72px] px-2 lg:px-4 justify-center items-center gap-1 rounded transition-colors text-gray-900 hover:bg-gray-50"
    >
<span  class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4224 20.75 15.6385 19.8666 17.3437 18.4043L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4043 17.3437C19.8666 15.6385 20.75 13.4224 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11Z" fill="#161616"/>
</svg>
</span>
      <span
        class="hidden sm:inline text-sm lg:text-base font-medium font-ibm-plex-arabic"
      >
        {{ 'header.search' | translate }}
      </span>
    </button>

    <!-- Search Popup -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 px-4 transition-opacity duration-300"
    >
      <div
        class="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-center border-b border-gray-200 px-6 py-4"
        >
          <h3
            class="text-lg sm:text-xl font-bold text-gray-900 font-ibm-plex-arabic"
          >
            عن ماذا تبحث ؟
          </h3>
          <button
            (click)="toggleSearch()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="إغلاق"
          >
            <img
              src="assets/images/cancel-circle.svg"
              alt="Close"
              class="w-5 h-5 sm:w-6 sm:h-6"
            />
          </button>
        </div>

        <!-- Search Form -->
        <div class="p-6">
          <form (submit)="onSearch($event)" class="flex flex-col sm:flex-row gap-3">
            <input
              [(ngModel)]="query"
              name="term"
              id="siteSearchInputMegaMenu"
              type="text"
              placeholder="كلمات البحث"
              aria-label="search"
              class="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none text-gray-800 font-ibm-plex-arabic"
            />
            <button
              type="submit"
              class="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded font-ibm-plex-arabic transition-colors"
            >
              بحث
            </button>
          </form>

          <!-- Suggestions -->
          <ul id="suggestionsList" class="mt-4 text-gray-700 space-y-2 font-ibm-plex-arabic">
            <li *ngFor="let suggestion of suggestions" class="cursor-pointer hover:text-green-700">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

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
          class="flex px-4 py-3 text-left transition-colors"
          [class]="isActive(item) ? 'bg-green-100 text-green-800' : 'text-gray-900 hover:bg-gray-50'"
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
    </div>  </div>
  `,
})
export class MainNavHeaderComponent implements OnInit, OnDestroy {
  isOpen = false;
  query = '';
  suggestions: string[] = [];
  currentLanguage: string = 'ar';
  showMobileMenu: boolean = false;
  dropdownOpen = false;
  currentRoute: string = '';
  
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
    private route: ActivatedRoute,
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

    // Subscribe to route changes to track current route
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentRoute = this.router.url;
      });

    // Initialize current route
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Add the missing isActive method
  isActive(item: NavigationItem): boolean {
    if (item.path === '/') {
      return this.currentRoute === '/';
    }
    return this.currentRoute.startsWith(item.path || '');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  navigateToItem(item: NavigationItem): void {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }

  toggleLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    this.dropdownOpen = false;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
  }

  toggleSearch() {
    this.isOpen = !this.isOpen;
  }

  onSearch(event: Event) {
    event.preventDefault();
    console.log('Searching for:', this.query);
  }
}