import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
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
<div class="container mx-auto">
  <div class="p-4 md:pb-[80px] md:px-[80px] flex flex-col gap-3 overflow-hidden relative">
    <h2 class="font-ibm-plex-arabic text-[30px] font-bold">
      {{ 'partners.title' | translate }}
    </h2>

    <div class="relative w-full">
      <!-- Left Arrow -->
      <button
        type="button"
        (click)="scrollLeft()"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 border border-gray-300 rounded-full shadow-md hover:bg-gray-100 p-2 focus:outline-none"
        aria-label="Scroll left"
      >
        <i class="bx bx-chevron-left text-2xl"></i>
      </button>

      <!-- Slider Track -->
      <div
        #slider
        class="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-8 scrollbar-hide px-6 py-4 items-center"
      >
        <ng-container *ngFor="let partner of displayPartners">
          <div class="flex-shrink-0 snap-start partner-item">
            <ng-container *ngIf="isValidUrl(partner.link); else noLinkTpl">
              <a
                [href]="safeUrl(partner.link)!"
                target="_blank"
                rel="noopener noreferrer"
                class="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 w-40 h-32 flex items-center justify-center border border-gray-100 cursor-pointer focus:outline-none focus:ring"
                [attr.aria-label]="partner.title"
              >
                <img
                  [src]="partner.imageUrl"
                  [alt]="partner.title"
                  class="max-w-full max-h-full object-contain hover:grayscale-0 transition-all duration-300"
                />
              </a>
            </ng-container>

            <ng-template #noLinkTpl>
              <div
                class="bg-white rounded-lg shadow-lg p-6 w-40 h-32 flex items-center justify-center border border-gray-100 opacity-90"
                title="لا يوجد رابط"
              >
                <img
                  [src]="partner.imageUrl"
                  [alt]="partner.title"
                  class="max-w-full max-h-full object-contain transition-all duration-300"
                />
              </div>
            </ng-template>
          </div>
        </ng-container>
      </div>

      <!-- Right Arrow -->
      <button
        type="button"
        (click)="scrollRight()"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 border border-gray-300 rounded-full shadow-md hover:bg-gray-100 p-2 focus:outline-none"
        aria-label="Scroll right"
      >
        <i class="bx bx-chevron-right text-2xl"></i>
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    /* hide scrollbar cross-browser (if plugin not used) */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* ensure partner items are consistent */
    .partner-item { width: 10rem; /* matches w-40 */ }
  `],
})
export class PartnersComponent implements OnInit, AfterViewInit, OnDestroy {
  partners: Partner[] = [];              // original partners from API
  displayPartners: Partner[] = [];       // duplicated partners for loop illusion
  private apiSub?: Subscription;
  baseUrl = environment.apiBaseUrl;

  @ViewChild('slider', { static: false }) slider!: ElementRef<HTMLDivElement>;

  // internal
  private initTimeout?: any;
  private resizeTimeout?: any;

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const cached = JSON.parse(localStorage.getItem('partners') || 'null');
    const maxAge = 24 * 60 * 60 * 1000; // 1 day
    if (cached && (Date.now() - cached.timestamp < maxAge) && Array.isArray(cached.data)) {
      this.partners = cached.data;
      this.prepareDisplayPartners();
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
                imageUrl: p.image?.imageUrl ? `${this.baseUrl}${p.image.imageUrl}` : '',
              } as Partner;
            })
            .sort((a: Partner, b: Partner) => a.displayOrder - b.displayOrder);

          // fetch attachments and then initialize slider
          this.hydrateMissingImages();
        }
      },
      error: (err) => {
        console.error('Partners load error:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // view exists but partners may not be loaded yet.
    // If partners were loaded from cache in ngOnInit, prepare slider now.
    if (this.partners && this.partners.length) {
      // small delay to allow rendering
      this.scheduleInitSlider();
    }
  }

  ngOnDestroy(): void {
    this.apiSub?.unsubscribe();
    if (this.initTimeout) clearTimeout(this.initTimeout);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  // ======= IMAGE HYDRATION & CACHING =======
  private hydrateMissingImages() {
    const tasks = this.partners.map((p, idx) => {
      if (!p.imageId) return of({ idx, dataUrl: null });

      return this.apiService.getAttachment(p.imageId!)
        .pipe(
          map((dto: any) => {
            const att = dto?.result ?? dto ?? {};
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

      // cache and prepare display list
      localStorage.setItem('partners', JSON.stringify({ data: this.partners, timestamp: Date.now() }));
      this.prepareDisplayPartners();
    });
  }

  private prepareDisplayPartners() {
    // ensure we have at least one partner to render
    if (!this.partners || this.partners.length === 0) {
      this.displayPartners = [];
      return;
    }

    // duplicate partners for the infinite loop illusion
    this.displayPartners = this.partners.concat(this.partners);

    // let Angular render then init slider position
    this.cdr.detectChanges();
    this.scheduleInitSlider();
  }

  // ======= SLIDER INITIALIZATION =======
  private scheduleInitSlider(delay = 60) {
    if (this.initTimeout) clearTimeout(this.initTimeout);
    this.initTimeout = setTimeout(() => this.initSliderPosition(), delay);
  }

  private initSliderPosition() {
    const el = this.slider?.nativeElement;
    if (!el) return;

    // place scroll at the start of the second half so left and right can move seamlessly
    const half = Math.floor(el.scrollWidth / 2);
    // only set position if we haven't scrolled or the position is near 0
    if (el.scrollLeft === 0 || el.scrollLeft < 5) {
      el.scrollLeft = half;
    }
  }

  // ======= SCROLLING =======
  private computeScrollStep(): number {
    const el = this.slider?.nativeElement;
    if (!el) return 240; // fallback

    const firstItem = el.querySelector<HTMLElement>('.partner-item');
    if (!firstItem) return 240;
    const itemWidth = firstItem.offsetWidth;
    // gap-8 equals 2rem (32px) in default Tailwind; but to be safe read computed gap if available
    const style = window.getComputedStyle(el);
    // CSS gap supported on flex container; read row-gap/column-gap (column-gap for horizontal)
    const gap = parseFloat(style.columnGap || style.gap || '0') || 32;
    return Math.round(itemWidth + gap);
  }

  scrollLeft() {
    const el = this.slider?.nativeElement;
    if (!el) return;

    const step = this.computeScrollStep();
    // if near start, jump to middle first to preserve illusion then scroll left
    if (el.scrollLeft <= step) {
      el.scrollLeft = Math.floor(el.scrollWidth / 2) + (el.scrollLeft - step);
    }
    el.scrollBy({ left: -step, behavior: 'smooth' });
  }

  scrollRight() {
    const el = this.slider?.nativeElement;
    if (!el) return;

    const step = this.computeScrollStep();
    el.scrollBy({ left: step, behavior: 'smooth' });

    // if near end, wrap to start after scrolling
    const maxLeft = el.scrollWidth - el.clientWidth;
    // use a small timeout to allow smooth scroll to progress; adjust as needed
    setTimeout(() => {
      if (el.scrollLeft >= maxLeft - step) {
        // reposition to equivalent spot in first half
        el.scrollLeft = Math.floor(el.scrollWidth / 2) - (maxLeft - el.scrollLeft);
      }
    }, 300);
  }

  // Optional: if you want auto-play, implement interval here and pause on hover

  // ======= MIME & URL HELPERS =======
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

  normalizeUrl(raw?: string): string | null {
    if (!raw) return null;
    const clean = raw.trim();
    if (!clean) return null;
    const hasScheme = /^(https?:)?\/\//i.test(clean);
    const finalUrl = hasScheme ? clean : `https://${clean}`;
    try {
      const u = new URL(finalUrl);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : null;
    } catch {
      return null;
    }
  }

  isValidUrl(raw?: string | null): boolean {
    return !!this.normalizeUrl(raw || undefined);
  }

  safeUrl(raw?: string | null): SafeUrl | null {
    const u = this.normalizeUrl(raw || undefined);
    return u ? this.sanitizer.bypassSecurityTrustUrl(u) : null;
  }
}
