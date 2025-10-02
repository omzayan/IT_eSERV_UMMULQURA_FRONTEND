import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsDetailsComponent } from './about-us-details.component';

describe('AboutUsDetailsComponent', () => {
  let component: AboutUsDetailsComponent;
  let fixture: ComponentFixture<AboutUsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
