import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordDashboardComponent } from './discord-dashboard.component';

describe('DiscordDashboardComponent', () => {
  let component: DiscordDashboardComponent;
  let fixture: ComponentFixture<DiscordDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
