import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../core';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Partner {
  id: number;
  title: string;
  link?: string | null;
  imageId?: number;
  imageUrl: string;
  displayOrder: number;
  showOnWebsite?: boolean;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-4 md:pb-[80px] md:px-[80px] flex flex-col gap-3 overflow-hidden">
      <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
        {{ 'partners.title' | translate }}
      </h2>

      <div class="relative">
        <div class="flex partners-animate-scroll">
          <!-- pass #1 -->
          <ng-container *ngFor="let partner of partners">
            <div class="flex-shrink-0 mx-8">
              <ng-container *ngIf="isValidUrl(partner.link); else noLinkTpl1">
                <a
                  [href]="safeUrl(partner.link)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32
                         flex items-center justify-center border border-gray-100 cursor-pointer focus:outline-none focus:ring"
                  [attr.aria-label]="partner.title"
                >
                  <img
                    [src]="partner.imageUrl"
                    [alt]="partner.title"
                    class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </a>
              </ng-container>
              <ng-template #noLinkTpl1>
                <div
                  class="bg-white rounded-lg shadow-lg p-6 w-40 h-32 flex items-center justify-center border border-gray-100 opacity-90"
                  title="لا يوجد رابط"
                >
                  <img
                    [src]="partner.imageUrl"
                    [alt]="partner.title"
                    class="max-w-full max-h-full object-contain filter grayscale transition-all duration-300"
                  />
                </div>
              </ng-template>
            </div>
          </ng-container>

          <!-- duplicate for infinite scroll (pass #2) -->
          <ng-container *ngFor="let partner of partners">
            <div class="flex-shrink-0 mx-8">
              <ng-container *ngIf="isValidUrl(partner.link); else noLinkTpl2">
                <a
                  [href]="safeUrl(partner.link)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32
                         flex items-center justify-center border border-gray-100 cursor-pointer focus:outline-none focus:ring"
                  [attr.aria-label]="partner.title"
                >
                  <img
                    [src]="partner.imageUrl"
                    [alt]="partner.title"
                    class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </a>
              </ng-container>
              <ng-template #noLinkTpl2>
                <div
                  class="bg-white rounded-lg shadow-lg p-6 w-40 h-32 flex items-center justify-center border border-gray-100 opacity-90"
                  title="لا يوجد رابط"
                >
                  <img
                    [src]="partner.imageUrl"
                    [alt]="partner.title"
                    class="max-w-full max-h-full object-contain filter grayscale transition-all duration-300"
                  />
                </div>
              </ng-template>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
      @keyframes partners-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .partners-animate-scroll { animation: partners-scroll 30s linear infinite; }
      .partners-animate-scroll:hover { animation-play-state: paused; }
  `],
})
export class PartnersComponent implements OnInit, OnDestroy {
  partners: Partner[] = [];
  private apiSub?: Subscription;
  baseUrl = environment.apiBaseUrl;

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const cached = JSON.parse(localStorage.getItem('partners') || 'null');
    const maxAge = 24 * 60 * 60 * 1000; 
    if (cached && (Date.now() - cached.timestamp < maxAge)) {
      this.partners = cached.data;
      return;
    }

    this.apiSub = this.apiService.getPartners().subscribe({
      next: (res: any) => {
        if (res && res.result) {
          this.partners = res.result
            .filter((p: any) => p.showOnWebsite)
            .map((p: any) => {
              const cleanLink = this.normalizeUrl(p.link || undefined);

              return {
                id: p.id,
                title: p.title,
                link: cleanLink,
                imageId: p.imageId,
                displayOrder: Number(p.displayOrder),
                showOnWebsite: p.showOnWebsite,
                imageUrl: p.image?.imageUrl ? `https://localhost:44311${p.image.imageUrl}` : '',
              } as Partner;
            })
            .sort((a: Partner, b: Partner) => a.displayOrder - b.displayOrder);

          this.hydrateMissingImages();
        }
      },
      error: (err) => console.error('Partners load error:', err),
    });
  }

  ngOnDestroy(): void {
    this.apiSub?.unsubscribe();
  }

  private hydrateMissingImages() {
    const tasks = this.partners.map((p, idx) => {
      if (!p.imageId) return of({ idx, dataUrl: null });

      return this.apiService.getAttachment(p.imageId!)
        .pipe(
          map((dto: any) => {
            const att = dto?.result ?? dto ?? {};

            // ⬇️ نستخدم Base64 مباشرةً
            if (att.bytes) {
              const mime = this.detectMimeFromName(att.fileName ?? att.fileExt);
              const dataUrl = `data:${mime};base64,${att.bytes}`;
              return { idx, dataUrl };
            }

            return { idx, dataUrl: null };
          }),
          catchError(() => of({ idx, dataUrl: null }))
        );
    });

    forkJoin(tasks).subscribe(results => {
      results.forEach(r => {
        if (r?.dataUrl) {
          this.partners[r.idx].imageUrl = r.dataUrl;
        }
      });
      localStorage.setItem('partners', JSON.stringify({ data: this.partners, timestamp: Date.now() }));
    });
  }

  private detectMimeFromName(nameOrExt?: string): string {
    const ext = ((nameOrExt || '').includes('.')
      ? nameOrExt!.slice(nameOrExt!.lastIndexOf('.'))
      : nameOrExt || ''
    ).toLowerCase();

    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.gif': return 'image/gif';
      default: return 'image/jpeg';
    }
  }

  // ===== Helpers =====
  normalizeUrl(raw?: string): string | null {
    if (!raw) return null;
    const clean = raw.trim();
    if (!clean) return null;
    const hasScheme = /^(https?:)?\/\//i.test(clean);
    const finalUrl = hasScheme ? clean : `https://${clean}`;
    try {
      const u = new URL(finalUrl);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : null;
    } catch { return null; }
  }
  isValidUrl(raw?: string | null): boolean { return !!this.normalizeUrl(raw || undefined); }
  safeUrl(raw?: string | null): SafeUrl | null {
    const u = this.normalizeUrl(raw || undefined);
    return u ? this.sanitizer.bypassSecurityTrustUrl(u) : null;
  }
}
