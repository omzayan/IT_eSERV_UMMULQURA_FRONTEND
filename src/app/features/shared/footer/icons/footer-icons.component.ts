import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-twitter-x-icon',
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
        d="M9.52 6.77L15.48 0H14.07L8.89 5.88L4.76 0H0L6.24 8.9L0 16H1.41L6.87 9.78L11.24 16H16L9.52 6.77ZM7.58 8.97L6.95 8.09L1.92 1.04H4.08L8.15 6.73L8.78 7.61L14.07 15.01H11.91L7.58 8.97Z"
        fill="currentColor"
      />
    </svg>
  `,
})
export class TwitterXIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-linkedin-icon',
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
        d="M3.58 1.54C3.58 2.39 2.89 3.08 2.04 3.08C1.19 3.08 0.5 2.39 0.5 1.54C0.5 0.69 1.19 0 2.04 0C2.89 0 3.58 0.69 3.58 1.54ZM3.58 4.62H0.5V16H3.58V4.62ZM8.65 4.62H5.58V16H8.65V10.02C8.65 7.19 12.42 6.92 12.42 10.02V16H15.5V8.85C15.5 4.08 9.96 4.27 8.65 6.54V4.62Z"
        fill="currentColor"
      />
    </svg>
  `,
})
export class LinkedInIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-instagram-icon',
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
        d="M8 1.44C10.13 1.44 10.39 1.45 11.23 1.49C12.02 1.52 12.44 1.65 12.73 1.76C13.11 1.91 13.39 2.09 13.68 2.38C13.97 2.67 14.15 2.95 14.3 3.33C14.41 3.62 14.54 4.04 14.57 4.83C14.61 5.67 14.62 5.93 14.62 8.06C14.62 10.19 14.61 10.45 14.57 11.29C14.54 12.08 14.41 12.5 14.3 12.79C14.15 13.17 13.97 13.45 13.68 13.74C13.39 14.03 13.11 14.21 12.73 14.36C12.44 14.47 12.02 14.6 11.23 14.63C10.39 14.67 10.13 14.68 8 14.68C5.87 14.68 5.61 14.67 4.77 14.63C3.98 14.6 3.56 14.47 3.27 14.36C2.89 14.21 2.61 14.03 2.32 13.74C2.03 13.45 1.85 13.17 1.7 12.79C1.59 12.5 1.46 12.08 1.43 11.29C1.39 10.45 1.38 10.19 1.38 8.06C1.38 5.93 1.39 5.67 1.43 4.83C1.46 4.04 1.59 3.62 1.7 3.33C1.85 2.95 2.03 2.67 2.32 2.38C2.61 2.09 2.89 1.91 3.27 1.76C3.56 1.65 3.98 1.52 4.77 1.49C5.61 1.45 5.87 1.44 8 1.44ZM8 0C5.83 0 5.55 0.01 4.7 0.05C3.85 0.09 3.27 0.22 2.76 0.42C2.23 0.63 1.78 0.9 1.33 1.35C0.88 1.8 0.61 2.25 0.4 2.78C0.2 3.29 0.07 3.87 0.03 4.72C-0.01 5.57 0 5.85 0 8.02C0 10.19 -0.01 10.47 0.03 11.32C0.07 12.17 0.2 12.75 0.4 13.26C0.61 13.79 0.88 14.24 1.33 14.69C1.78 15.14 2.23 15.41 2.76 15.62C3.27 15.82 3.85 15.95 4.7 15.99C5.55 16.03 5.83 16.04 8 16.04C10.17 16.04 10.45 16.03 11.3 15.99C12.15 15.95 12.73 15.82 13.24 15.62C13.77 15.41 14.22 15.14 14.67 14.69C15.12 14.24 15.39 13.79 15.6 13.26C15.8 12.75 15.93 12.17 15.97 11.32C16.01 10.47 16.02 10.19 16.02 8.02C16.02 5.85 16.01 5.57 15.97 4.72C15.93 3.87 15.8 3.29 15.6 2.78C15.39 2.25 15.12 1.8 14.67 1.35C14.22 0.9 13.77 0.63 13.24 0.42C12.73 0.22 12.15 0.09 11.3 0.05C10.45 0.01 10.17 0 8 0Z"
        fill="currentColor"
      />
      <path
        d="M8 3.89C5.73 3.89 3.89 5.73 3.89 8C3.89 10.27 5.73 12.11 8 12.11C10.27 12.11 12.11 10.27 12.11 8C12.11 5.73 10.27 3.89 8 3.89ZM8 10.67C6.52 10.67 5.33 9.48 5.33 8C5.33 6.52 6.52 5.33 8 5.33C9.48 5.33 10.67 6.52 10.67 8C10.67 9.48 9.48 10.67 8 10.67Z"
        fill="currentColor"
      />
      <circle cx="12.27" cy="3.73" r="0.89" fill="currentColor" />
    </svg>
  `,
})
export class InstagramIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-sign-language-icon',
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
        d="M6.5 1C5.12 1 4 2.12 4 3.5V6.5C4 6.78 4.22 7 4.5 7S5 6.78 5 6.5V3.5C5 2.67 5.67 2 6.5 2S8 2.67 8 3.5V7.5C8 7.78 8.22 8 8.5 8S9 7.78 9 7.5V3.5C9 2.12 7.88 1 6.5 1Z"
        fill="currentColor"
      />
      <path
        d="M2.5 4C1.12 4 0 5.12 0 6.5V9.5C0 10.88 1.12 12 2.5 12S5 10.88 5 9.5V6.5C5 5.12 3.88 4 2.5 4ZM4 9.5C4 10.33 3.33 11 2.5 11S1 10.33 1 9.5V6.5C1 5.67 1.67 5 2.5 5S4 5.67 4 6.5V9.5Z"
        fill="currentColor"
      />
      <path
        d="M13.5 4C12.12 4 11 5.12 11 6.5V9.5C11 10.88 12.12 12 13.5 12S16 10.88 16 9.5V6.5C16 5.12 14.88 4 13.5 4ZM15 9.5C15 10.33 14.33 11 13.5 11S12 10.33 12 9.5V6.5C12 5.67 12.67 5 13.5 5S15 5.67 15 6.5V9.5Z"
        fill="currentColor"
      />
      <path
        d="M10.5 6C9.12 6 8 7.12 8 8.5V11.5C8 12.88 9.12 14 10.5 14S13 12.88 13 11.5V8.5C13 7.12 11.88 6 10.5 6ZM12 11.5C12 12.33 11.33 13 10.5 13S9 12.33 9 11.5V8.5C9 7.67 9.67 7 10.5 7S12 7.67 12 8.5V11.5Z"
        fill="currentColor"
      />
    </svg>
  `,
})
export class SignLanguageIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-search-add-icon',
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
        d="M6.5 1C3.46 1 1 3.46 1 6.5S3.46 12 6.5 12C7.75 12 8.9 11.58 9.82 10.87L14.23 15.28C14.52 15.57 14.98 15.57 15.27 15.28C15.56 14.99 15.56 14.53 15.27 14.24L10.86 9.83C11.57 8.91 12 7.76 12 6.5C12 3.46 9.54 1 6.5 1ZM6.5 2C8.99 2 11 4.01 11 6.5S8.99 11 6.5 11S2 8.99 2 6.5S4.01 2 6.5 2Z"
        fill="currentColor"
      />
      <path
        d="M6.5 4C6.22 4 6 4.22 6 4.5V6H4.5C4.22 6 4 6.22 4 6.5S4.22 7 4.5 7H6V8.5C6 8.78 6.22 9 6.5 9S7 8.78 7 8.5V7H8.5C8.78 7 9 6.78 9 6.5S8.78 6 8.5 6H7V4.5C7 4.22 6.78 4 6.5 4Z"
        fill="currentColor"
      />
    </svg>
  `,
})
export class SearchAddIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-view-icon',
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
        d="M8 2C4.5 2 1.73 4.61 1 8C1.73 11.39 4.5 14 8 14S14.27 11.39 15 8C14.27 4.61 11.5 2 8 2ZM8 12.5C5.52 12.5 3.5 10.48 3.5 8S5.52 3.5 8 3.5S12.5 5.52 12.5 8S10.48 12.5 8 12.5Z"
        fill="currentColor"
      />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    </svg>
  `,
})
export class ViewIconComponent {
  @Input() className: string = '';
}

@Component({
  selector: 'app-link-square-icon',
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
        d="M13 0H10C9.45 0 9 0.45 9 1S9.45 2 10 2H12.59L5.29 9.29C4.9 9.68 4.9 10.32 5.29 10.71C5.68 11.1 6.32 11.1 6.71 10.71L14 3.41V6C14 6.55 14.45 7 15 7S16 6.55 16 6V3C16 1.34 14.66 0 13 0Z"
        fill="currentColor"
      />
      <path
        d="M11 8C10.45 8 10 8.45 10 9V13H3V6H7C7.55 6 8 5.55 8 5S7.55 4 7 4H3C1.34 4 0 5.34 0 7V13C0 14.66 1.34 16 3 16H11C12.66 16 14 14.66 14 13V9C14 8.45 13.55 8 13 8H11Z"
        fill="currentColor"
      />
    </svg>
  `,
})
export class LinkSquareIconComponent {
  @Input() className: string = '';
}
