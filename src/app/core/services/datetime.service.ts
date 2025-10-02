import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface DateTimeInfo {
  time: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  private dateTimeSubject = new BehaviorSubject<DateTimeInfo>(
    this.getCurrentDateTime()
  );

  constructor() {
    // Update time every second
    interval(1000).subscribe(() => {
      this.dateTimeSubject.next(this.getCurrentDateTime());
    });
  }

  getDateTime(): Observable<DateTimeInfo> {
    return this.dateTimeSubject.asObservable();
  }

  private getCurrentDateTime(): DateTimeInfo {
    const now = new Date();

    // Format time (HH:MM AM/PM)
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Format date (DD/MM/YYYY)
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return { time, date };
  }
}
