import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordReportComponent } from './discord-report.component';

describe('DiscordReportComponent', () => {
  let component: DiscordReportComponent;
  let fixture: ComponentFixture<DiscordReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
