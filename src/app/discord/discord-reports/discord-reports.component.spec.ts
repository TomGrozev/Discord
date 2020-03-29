import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordReportsComponent } from './discord-reports.component';

describe('DiscordReportsComponent', () => {
  let component: DiscordReportsComponent;
  let fixture: ComponentFixture<DiscordReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
