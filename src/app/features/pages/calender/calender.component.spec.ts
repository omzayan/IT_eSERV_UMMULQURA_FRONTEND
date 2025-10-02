import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalenderComponent } from './calender.component';
import { LanguageService } from '../../../core/services/language.service';
import { of } from 'rxjs';
import { DailyPrayerTimesComponent } from '../../components/daily-prayer-times/daily-prayer-times.component';

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {
    const languageServiceSpy = jasmine.createSpyObj('LanguageService', [], {
      currentLanguage$: of('en'),
    });

    await TestBed.configureTestingModule({
      imports: [
        CalenderComponent,
        TranslateModule.forRoot(),
        DailyPrayerTimesComponent,
      ],
      providers: [
        TranslateService,
        { provide: LanguageService, useValue: languageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    mockLanguageService = TestBed.inject(
      LanguageService
    ) as jasmine.SpyObj<LanguageService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with prayTime as active tab', () => {
    expect(component.activeTab).toBe('prayTime');
  });

  it('should have three tabs', () => {
    expect(component.tabs.length).toBe(3);
    expect(component.tabs[0].id).toBe('prayTime');
    expect(component.tabs[1].id).toBe('umqurra');
    expect(component.tabs[2].id).toBe('dateConverter');
  });

  it('should change active tab when handleTabChange is called', () => {
    component.handleTabChange('umqurra');
    expect(component.activeTab).toBe('umqurra');
  });

  it('should set isRtl to true when language is Arabic', () => {
    // Update the spy to return Arabic language
    Object.defineProperty(mockLanguageService, 'currentLanguage$', {
      value: of('ar'),
    });

    component.ngOnInit();

    expect(component.isRtl).toBe(true);
  });
});
