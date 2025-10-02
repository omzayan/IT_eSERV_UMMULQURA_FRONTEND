import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CheckIconComponent } from '../../shared/icons/apis-icons.component';

@Component({
    selector: 'app-feedback-card',
    standalone: true,
    imports: [CommonModule, TranslateModule, CheckIconComponent],
    template: `
    <div class="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col w-full mt-8">
      <div class="flex flex-col gap-2 w-full">
        <!-- Icon + Title -->
        <div class="flex flex-col gap-2">
          <app-check-icon></app-check-icon>
          <span class="font-bold text-[#161616] text-base">{{ title }}</span>
        </div>

        <!-- Description -->
        <div class="text-[#384250] text-sm mb-2">
          {{ description }}
        </div>

        <!-- Button -->
        <div class="flex w-full">
          <button
            class="bg-[#1B8354] text-white px-3 py-1 rounded text-xs font-medium w-fit"
            (click)="onButtonClick()"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class FeedbackCardComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() buttonText: string = '';
    @Output() buttonClick = new EventEmitter<void>();

    onButtonClick() {
        this.buttonClick.emit();
    }
}
