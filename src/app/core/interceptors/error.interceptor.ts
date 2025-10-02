import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorHandlingService } from '../services/error-handling.service.js';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlingService) as ErrorHandlingService;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorHandler.handleError(error);
      return throwError(() => error);
    })
  );
};
