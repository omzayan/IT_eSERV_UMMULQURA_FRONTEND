import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  UnifiedDatePickerComponent,
  DatePickerValue,
  DatePickerType,
} from '../../shared/unified-date-picker/unified-date-picker.component';
import { ApiService } from '../../../core/services/api.service';
import { BaseResponse, DateConversionResult, GregorianDateInput, HijriDateInput, Result } from '../../../core/types/api.types';

@Component({
  selector: 'app-date-converter',
  standalone: true,
  imports: [CommonModule, TranslateModule, UnifiedDatePickerComponent],
  template: `
    <div class="w-full flex flex-col gap-4">
      <div class="flex gap-4 w-full">
        <div class="w-1/2">
          <div class="flex flex-col gap-3">
            <label class="block text-sm font-medium text-gray-700 ">
              {{ getSourceLabel() | translate }}
            </label>
            <select
              name="citySelect"
              id="citySelect"
              [value]="conversionType"
              (change)="setConversionType($event)"
              class="ps-4 pe-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B8354] focus:border-transparent w-full appearance-none"
            >
              <option value="hijri-to-gregorian">
                {{ 'dateConverter.hijriToGregorian' | translate }}
              </option>
              <option value="gregorian-to-hijri">
                {{ 'dateConverter.gregorianToHijri' | translate }}
              </option>
            </select>
          </div>
        </div>
        <div class="w-1/2">
          <app-unified-date-picker
            [type]="getSourceDateType()"
            [value]="sourceDate"
            (valueChange)="onSourceDateChange($event)"
            [placeholder]="'dateConverter.selectDate' | translate"
            [label]="'dateConverter.selectDate' | translate"
          ></app-unified-date-picker>
        </div>
      </div>

      <button
        (click)="convertDate()"
        [disabled]="!sourceDate || isConverting"
        class="bg-[#1B8354] hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium font-ibm-plex-arabic"
      >
        <span *ngIf="!isConverting">{{
          'dateConverter.convert' | translate
        }}</span>
        <span *ngIf="isConverting" class="flex items-center justify-center">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          {{ 'common.converting' | translate }}
        </span>
      </button>
      <!-- Conversion Result Display -->
      <div
        *ngIf="conversionResult || conversionError"
        class="mt-6 transition-all duration-300 ease-in-out"
      >
        <!-- Success Result -->
        <div
          *ngIf="conversionResult && !conversionError"
          class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
            >
              <i class="fas fa-check text-green-600 text-lg"></i>
            </div>
            <div>
              <h3
                class="text-lg font-semibold text-green-800 font-ibm-plex-arabic"
              >
                {{ 'dateConverter.conversionResult' | translate }}
              </h3>
              <p class="text-sm text-green-600">
                {{ getTargetLabel() | translate }}
              </p>
            </div>
          </div>

          <!-- Main Result Display -->
          <div class="bg-white rounded-lg p-4 border border-green-100 mb-4">
            <div class="text-center">
              <div
                class="text-3xl font-bold text-gray-800 mb-2 font-ibm-plex-arabic"
              >
                {{ getFormattedResult() }}
              </div>
              <div class="text-lg text-gray-600 font-ibm-plex-arabic">
                {{ getDetailedResult() }}
              </div>
              <div
                *ngIf="conversionResult.day_name"
                class="text-sm text-gray-500 mt-2 font-ibm-plex-arabic"
              >
                {{ conversionResult.day_name }}
              </div>
            </div>
          </div>

          <!-- Additional Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Source Date Info -->
            <div class="bg-white rounded-lg p-4 border border-green-100">
              <h4
                class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 font-ibm-plex-arabic"
              >
                <i class="fas fa-calendar-alt text-blue-500"></i>
                {{ getSourceLabel() | translate }}
              </h4>
              <div class="space-y-1">
             <div
  class="text-lg font-medium text-gray-800 font-ibm-plex-arabic"
>
  {{ conversionResult.day }} {{ conversionResult.month_name }} {{ conversionResult.year }}
</div>

                <div class="text-sm text-gray-600 font-ibm-plex-arabic">
                  {{
                    conversionType === 'hijri-to-gregorian'
                      ? getHijriDetails()
                      : getGregorianDetails()
                  }}
                </div>
              </div>
            </div>

            <!-- Target Date Info -->
            <div class="bg-white rounded-lg p-4 border border-green-100">
              <h4
                class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 font-ibm-plex-arabic"
              >
                <i class="fas fa-exchange-alt text-green-500"></i>
                {{ getTargetLabel() | translate }}
              </h4>
              <div class="space-y-1">
                      <div
  class="text-lg font-medium text-gray-800 font-ibm-plex-arabic"
>
  {{ conversionResult.day }} {{ conversionResult.month_name }} {{ conversionResult.year }}
</div>
                <div class="text-sm text-gray-600 font-ibm-plex-arabic">
                  {{
                    conversionType === 'hijri-to-gregorian'
                      ? getGregorianDetails()
                      : getHijriDetails()
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          *ngIf="conversionError"
          class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
            >
              <i class="fas fa-exclamation-triangle text-red-600 text-lg"></i>
            </div>
            <div>
              <h3
                class="text-lg font-semibold text-red-800 font-ibm-plex-arabic"
              >
                {{ 'dateConverter.conversionError' | translate }}
              </h3>
              <p class="text-sm text-red-600">
                {{ 'dateConverter.tryAgain' | translate }}
              </p>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 border border-red-100">
            <div class="text-red-700 font-ibm-plex-arabic">
              {{ conversionError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DateConverterComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  conversionType: 'hijri-to-gregorian' | 'gregorian-to-hijri' =
    'hijri-to-gregorian';
  sourceDate: DatePickerValue | null = null;
conversionResult: Result | null = null;
  isConverting: boolean = false;
  conversionError: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setConversionType(event: Event) {
    this.conversionType = (event.target as HTMLSelectElement).value as
      | 'hijri-to-gregorian'
      | 'gregorian-to-hijri';
    this.sourceDate = null;
    this.conversionResult = null;
    this.conversionError = null;
  }

  getSourceDateType(): DatePickerType {
    return this.conversionType === 'hijri-to-gregorian' ? 'hijri' : 'gregorian';
  }

  getSourceLabel(): string {
    return this.conversionType === 'hijri-to-gregorian'
      ? 'dateConverter.hijriDate'
      : 'dateConverter.gregorianDate';
  }

  getTargetLabel(): string {
    return this.conversionType === 'hijri-to-gregorian'
      ? 'dateConverter.gregorianDate'
      : 'dateConverter.hijriDate';
  }

  onSourceDateChange(date: DatePickerValue | null) {
    this.sourceDate = date;
    this.conversionResult = null;
    this.conversionError = null;
  }




convertDate() {
  if (!this.sourceDate) return;

  this.isConverting = true;
  this.conversionError = null;

  let conversionObservable: Observable<BaseResponse<Result>>;

  if (this.conversionType === 'hijri-to-gregorian') {
    const hijriInput: HijriDateInput = {
      day: this.sourceDate.dayNumber,
      month: this.sourceDate.month,
      year: this.sourceDate.year,
    };
    conversionObservable = this.apiService.convertHijriToGregorian(hijriInput);
  } else {
    const gregorianInput: GregorianDateInput = {
      day: this.sourceDate.dayNumber,
      month: this.sourceDate.month,
      year: this.sourceDate.year,
    };
    conversionObservable = this.apiService.convertGregorianToHijri(gregorianInput);
  }

  conversionObservable.pipe(takeUntil(this.destroy$)).subscribe({
    next: (response) => {
      this.isConverting = false;
      if (response.success && response.result) {
        this.conversionResult = response.result; // ✅ هنا Result
      } else {
        this.conversionError = 'Conversion failed';
      }
    },
    error: (error) => {
      this.isConverting = false;
      this.conversionError = error.message || 'Network error occurred';
      console.error('Date conversion error:', error);
    },
  });
}





getFormattedResult(): string {
  if (!this.conversionResult) return '';

  // عندنا بس iso كـ formatted date
  return this.conversionResult.iso;
}

getDetailedResult(): string {
  if (!this.conversionResult) return '';

  // نفس الشكل التفصيلي: 5 Safar 1500
  return `${this.conversionResult.day} ${this.conversionResult.month_name} ${this.conversionResult.year}`;
}

getHijriDetails(): string {
  if (!this.conversionResult) return '';

  // الريسبونس الحالي بيرجع يا Hijri يا Gregorian حسب التحويل
  // فممكن نسميه HijriDetails بس يرجع نفس الـ result
  return `${this.conversionResult.day} ${this.conversionResult.month_name} ${this.conversionResult.year}`;
}

getGregorianDetails(): string {
  if (!this.conversionResult) return '';

  return `${this.conversionResult.day} ${this.conversionResult.month_name} ${this.conversionResult.year}`;
}

}
