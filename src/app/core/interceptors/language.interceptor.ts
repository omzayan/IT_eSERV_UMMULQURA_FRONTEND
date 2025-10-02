import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const translateService = inject(TranslateService);
  const currentLang = translateService.currentLang;

  const modifiedReq = req.clone({
    headers: req.headers.set('lang', currentLang || 'ar'),
  });

  return next(modifiedReq);
};
