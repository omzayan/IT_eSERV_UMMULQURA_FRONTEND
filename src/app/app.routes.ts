import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (c) => c.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/pages/home/home.component').then(
            (c) => c.HomeComponent
          ),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./features/pages/about-us/about-us.component').then(
            (c) => c.AboutUsComponent
          ),
      },
      {
        path: 'pray-time',
        loadComponent: () =>
          import('./features/pages/pray-time/pray-time.component').then(
            (c) => c.PrayTimeComponent
          ),
      },
      {
        path: 'calender',
        loadComponent: () =>
          import('./features/pages/calender/calender.component').then(
            (c) => c.CalenderComponent
          ),
      },
      {
        path: 'hijri-calendar',
        loadComponent: () =>
          import(
            './features/pages/hijri-calendar/hijri-calendar.component'
          ).then((c) => c.HijriCalendarComponent),
      },
      {
        path: 'gregorian-calendar',
        loadComponent: () =>
          import(
            './features/pages/gregorian-calendar/gregorian-calendar.component'
          ).then((c) => c.GregorianCalendarComponent),
      },
         {
         path: 'date-converter',
        loadComponent: () =>
          import(
            './features/components/date-converter/date-converter.component'
          ).then((c) => c.DateConverterComponent),
      },
        {
         path: 'date-converter',
        loadComponent: () =>
          import(
            './features/components/date-converter/date-converter.component'
          ).then((c) => c.DateConverterComponent),
      },
       {
         path: 'weekly-prayer-times',
        loadComponent: () =>
          import(
            './features/components/weekly-prayer-times/weekly-prayer-times.component'
          ).then((c) => c.WeeklyPrayerTimesComponent),
      },
      
      {
        path: 'about-us-details',
        loadComponent: () =>
          import(
            './features/pages/about-us-details/about-us-details.component'
          ).then((c) => c.AboutUsDetailsComponent),
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./features/pages/contact-us/contact-us.component').then(
            (c) => c.ContactUsComponent
          ),
      },
      {
        path: 'apis',
        loadComponent: () =>
          import('./features/pages/apis/apis.component').then(
            (c) => c.ApisComponent
          ),
      },
      {
        path: 'communication-share',
        loadComponent: () =>
          import(
            './features/pages/communication-share/communication-share.component'
          ).then((c) => c.CommunicationShareComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
