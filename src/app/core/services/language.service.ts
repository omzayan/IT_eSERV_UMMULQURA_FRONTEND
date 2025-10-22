import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'app_language';
  private readonly DEFAULT_LANGUAGE = 'ar'; // Since the user prefers Arabic as default

  private currentLanguageSubject = new BehaviorSubject<string>(
    this.DEFAULT_LANGUAGE
  );
  public currentLanguage$: Observable<string> =
    this.currentLanguageSubject.asObservable();

  constructor(private translateService: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Initialize language from localStorage or use default
   */
  private initializeLanguage(): void {
    const savedLanguage = this.getLanguageFromStorage();
    const languageToUse = savedLanguage || this.DEFAULT_LANGUAGE;

    this.setLanguage(languageToUse, false); // Don't save to storage again during initialization
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Set language and persist to localStorage
   */
  setLanguage(language: string, saveToStorage: boolean = true): void {
    // Validate language
    if (!this.isValidLanguage(language)) {
      console.warn(
        `Invalid language: ${language}. Using default: ${this.DEFAULT_LANGUAGE}`
      );
      language = this.DEFAULT_LANGUAGE;
    }

    // Set language in translate service
    this.translateService.setDefaultLang(language);
    this.translateService.use(language);

    // Update current language subject
    this.currentLanguageSubject.next(language);

    // Update document direction and language attributes
    this.updateDocumentDirection(language);

    // Save to localStorage if requested
    if (saveToStorage) {
      this.saveLanguageToStorage(language);
    }
  }

  /**
   * Toggle between Arabic and English
   */
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const nextLanguage = currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLanguage);
  }

  /**
   * Check if language is Arabic
   */
  isArabic(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  /**
   * Check if language is English
   */
  isEnglish(): boolean {
    return this.getCurrentLanguage() === 'en';
  }

  /**
   * Get language from localStorage
   */
  private getLanguageFromStorage(): string | null {
    try {
      return localStorage.getItem(this.LANGUAGE_KEY);
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      return null;
    }
  }

  /**
   * Save language to localStorage
   */
  private saveLanguageToStorage(language: string): void {
    try {
      localStorage.setItem(this.LANGUAGE_KEY, language);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
  }

  /**
   * Validate if language is supported
   */
  private isValidLanguage(language: string): boolean {
    return ['ar', 'en', 'fr', 'ch', 'Tu', 'Ad', 'BN', 'IN'].includes(language);
  }

  /**
   * Update document direction and language attributes
   */
  private updateDocumentDirection(language: string): void {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }
}
