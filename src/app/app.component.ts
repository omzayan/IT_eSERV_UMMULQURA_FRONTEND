import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'um-alquraa-angular';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // The LanguageService will automatically initialize the language
    // from localStorage when it's injected and constructed
  }
}
