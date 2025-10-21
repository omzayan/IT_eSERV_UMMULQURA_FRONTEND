import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
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
export class FooterComponent implements OnInit {
  importantLinks: any[] = [];
  summaryLinks: any[] = [];
  groupTitleLinks: any[] = [];
  socialLinks: any[] = [];
  contactTools: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any>(`${environment.apiBaseUrl}api/services/app/Footer/GetList`)
      .subscribe({
        next: (res) => {
          const result = res?.result || [];

          this.importantLinks = this.getCategoryItems(result, 'ImportantLinks');
          this.summaryLinks = this.getCategoryItems(result, 'Summary');
          this.groupTitleLinks = this.getCategoryItems(result, 'GroupTitle');
          this.socialLinks = this.getCategoryItems(result, 'SocialLinks');
          this.contactTools = this.getCategoryItems(result, 'ContactTools');
        },
        error: (err) => console.error('Error loading footer links', err),
      });
  }

  private getCategoryItems(result: any[], category: string): any[] {
    const cat = result.find(x => x.category === category);
    return cat ? cat.items : [];
  }
}