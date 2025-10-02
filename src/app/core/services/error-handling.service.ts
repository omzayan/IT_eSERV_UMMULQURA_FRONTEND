import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(private toastr: ToastrService) {}

  handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An error occurred';
    let title = 'Error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      title = 'Client Error';
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message;
      title = `Error ${error.status}`;
    }

    this.toastr.error(errorMessage, title, {
      closeButton: true,
      timeOut: 5000,
      positionClass: 'toast-top-right',
    });

    // Still log to console for debugging
    console.error(errorMessage);
  }
}
