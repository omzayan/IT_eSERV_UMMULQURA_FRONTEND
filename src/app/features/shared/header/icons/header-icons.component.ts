import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-saudi-flag-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="14" fill="#006C35" />
      <path d="M4 4H16V5H4V4ZM4 6H16V7H4V6ZM4 8H16V9H4V8Z" fill="white" />
      <path
        d="M6 4.5C6 4.22386 6.22386 4 6.5 4H7.5C7.77614 4 8 4.22386 8 4.5C8 4.77614 7.77614 5 7.5 5H6.5C6.22386 5 6 4.77614 6 4.5Z"
        fill="white"
      />
    </svg>
  `,
})
export class SaudiFlagIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-dropdown-arrow-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class DropdownArrowIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-calendar-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class CalendarIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-clock-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M12 6V12L16 14"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class ClockIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-location-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <path
        d="M3.62001 8.49C5.59001 -0.169998 18.42 -0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39001 20.54C5.63001 17.88 2.47001 13.57 3.62001 8.49Z"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
  `,
})
export class LocationIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.61 20C18.95 20 20.99 18.18 20.99 15.97C20.99 13.76 18.95 11.94 16.61 11.94C16.28 11.94 15.96 11.99 15.66 12.07C14.56 8.62 11.24 6.19 7.44 6.19C2.46 6.19 -1.54 10.43 -0.3 15.97"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class WeatherIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-microphone-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.35001 9.65V11.35C4.35001 15.57 7.78001 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65M12 19V22M8 22H16"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class MicrophoneIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-search-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M21 21L16.65 16.65"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class SearchIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-eye-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42004 13.98 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C13.98 8.42004 15.58 10.02 15.58 12Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.46997 3.71997 5.17997 5.79997 2.88997 9.39997C1.98997 10.81 1.98997 13.18 2.88997 14.59C5.17997 18.19 8.46997 20.27 12 20.27Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class EyeIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-user-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class UserIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-language-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="className"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M8 3H5C5.55228 3 6 3.44772 6 4V20C6 20.5523 5.55228 21 5 21H8"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M16 3H19C18.4477 3 18 3.44772 18 4V20C18 20.5523 18.4477 21 19 21H16"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M12 2V22"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M2 12H22"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  `,
})
export class LanguageIconComponent {
  @Input() className: string = '';
}
