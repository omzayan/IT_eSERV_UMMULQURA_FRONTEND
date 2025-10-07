import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export class BackendTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

getTranslation(lang: string): Observable<any> {
  return this.http.get<{ result: any }>(`${environment.apiBaseUrl}api/services/app/Translations/GetTranslation?lang=${lang}`)
    .pipe(
      map(response => response.result)
    );
}
}
