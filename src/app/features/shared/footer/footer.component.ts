import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  TwitterXIconComponent,
  LinkedInIconComponent,
  InstagramIconComponent,
  SignLanguageIconComponent,
  SearchAddIconComponent,
  ViewIconComponent,
  LinkSquareIconComponent,
} from './icons/footer-icons.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TwitterXIconComponent,
    LinkedInIconComponent,
    InstagramIconComponent,
    SignLanguageIconComponent,
    SearchAddIconComponent,
    ViewIconComponent,
    LinkSquareIconComponent,
  ],
  templateUrl: './footer.component.html',
})
export class FooterComponent {}
