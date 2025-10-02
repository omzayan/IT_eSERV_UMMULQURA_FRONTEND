import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

export interface GregorianDateValue {
  year: number;
  month: number;
  day: number;
}

@Component({
  selector: 'app-gregorian-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
  ],
  templateUrl: './gregorian-date-picker.component.html',
  styleUrls: ['./gregorian-date-picker.component.css'],
})
export class GregorianDatePickerComponent implements OnInit {
  @Input() label?: string = 'datePickers.gregorian.selectDate';
  @Input() disabled: boolean = false;
  @Input() value?: GregorianDateValue;
  @Output() valueChange = new EventEmitter<GregorianDateValue>();

  selectedDate: Date = new Date();
  minDate: Date = new Date(1900, 0, 1);
  maxDate: Date = new Date(new Date().getFullYear() + 100, 11, 31);

  ngOnInit() {
    if (this.value) {
      this.selectedDate = new Date(
        this.value.year,
        this.value.month - 1,
        this.value.day
      );
    }
  }

  onDateChange(event: any) {
    const date = event.value as Date;
    if (date) {
      this.selectedDate = date;
      this.emitChange();
    }
  }

  private emitChange() {
    if (this.selectedDate) {
      const dateValue: GregorianDateValue = {
        year: this.selectedDate.getFullYear(),
        month: this.selectedDate.getMonth() + 1,
        day: this.selectedDate.getDate(),
      };
      this.valueChange.emit(dateValue);
    }
  }

  reset() {
    this.selectedDate = new Date();
    // Don't emit change on reset to avoid infinite loops
  }
}
