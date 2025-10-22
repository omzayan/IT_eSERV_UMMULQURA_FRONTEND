import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { takeUntil, Subject } from 'rxjs';
import {
  TwitterXIconComponent,
  LinkedInIconComponent,
  InstagramIconComponent,
  SignLanguageIconComponent,
  SearchAddIconComponent,
  ViewIconComponent,
  LinkSquareIconComponent,
} from './icons/footer-icons.component';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';

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
export class FooterComponent implements OnInit, OnDestroy {
  importantLinks: any[] = [];
  summaryLinks: any[] = [];
  groupTitleLinks: any[] = [];
  socialLinks: any[] = [];
  contactTools: any[] = [];
  currentLanguage: string = 'ar';

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private languageService: LanguageService) { }

  ngOnInit() {
    this.loadFooterLinks();
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang;
        this.updateTitlesByLanguage();
      });
  }

 private loadFooterLinks() {
  this.http.get<any>(`${environment.apiBaseUrl}api/services/app/Footer/GetList`)
    .subscribe({
      next: (res) => {
        const result = res?.result || [];
        this.importantLinks = this.getCategoryItems(result, 'ImportantLinks');
        this.summaryLinks = this.getCategoryItems(result, 'Summary');
        this.groupTitleLinks = this.getCategoryItems(result, 'GroupTitle');
        this.socialLinks = this.getCategoryItems(result, 'SocialLinks');
        this.contactTools = this.getCategoryItems(result, 'ContactTools');
        this.updateTitlesByLanguage();
      },
      error: (err) => console.error('Error loading footer links', err),
    });
}

  private getCategoryItems(result: any[], category: string): any[] {
    const cat = result.find(x => x.category === category);
    if (!cat) return [];
    return cat.items;
  }

  public getTitleByLanguage(item: any): string {
  if (!item) return '';
  
  const langKeyMap: Record<string, string[]> = {
    ar: ['ArabicTitle', 'arabicTitle'],
    en: ['EnglishTitle', 'englishTitle'], 
    fr: ['FrenchTitle', 'frenchTitle'],
    ch: ['ChineseTitle', 'chineseTitle'],
    Ad: ['UrduTitle', 'urduTitle'],
    IN: ['IndonesianTitle', 'indonesianTitle'],
    BN: ['BengaliTitle', 'bengaliTitle'],
    Tu: ['TurkishTitle', 'turkishTitle']
  };

  const keys = langKeyMap[this.currentLanguage] || ['ArabicTitle', 'arabicTitle'];
  
  for (const key of keys) {
    if (item[key] && item[key].trim() !== '') {
      return item[key];
    }
  }
    return item['ArabicTitle'] || item['arabicTitle'] || 'No Title';
}


  private updateTitlesByLanguage() {
  const updateItem = (item: any) => {
    if (item) {
      item.title = this.getTitleByLanguage(item);
    }
  };

  [this.importantLinks, this.summaryLinks, this.groupTitleLinks, this.socialLinks, this.contactTools]
    .forEach(arr => arr.forEach(updateItem));
}


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
